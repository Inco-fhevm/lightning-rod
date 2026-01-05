import { expect, test } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import IncoTest from '../src/Inco.tsx';
import { anvil } from 'viem/chains';
import { Address, createPublicClient, createWalletClient, http, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import addTwoBuild from '../../../../../contracts/out/AddTwo.sol/AddTwo.json';
import { addTwoAbi } from '../src/abis.js';
import { fundAccount, E2EConfig } from '../src/test-helpers.js';
import { Lightning } from '@inco/js/lite';

// Deploys the AddTwo.sol contract on the host chain.
async function deployAddTwo(cfg: E2EConfig): Promise<Address> {
  console.log();
  console.log(`Deploying AddTwo.sol contract ...`);
  await fundAccount(cfg.senderPrivKey, cfg.chain, cfg.hostChainRpcUrl);
  const account = privateKeyToAccount(cfg.senderPrivKey);
  const walletClient = createWalletClient({
    chain: cfg.chain,
    transport: http(cfg.hostChainRpcUrl),
  });

  const byteCode = addTwoBuild.bytecode.object as Hex;
  const txHash = await walletClient.deployContract({
    account,
    abi: addTwoAbi,
    bytecode: byteCode,
  });

  const publicClient = createPublicClient({
    chain: cfg.chain,
    transport: http(cfg.hostChainRpcUrl),
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  const contractAddress = receipt.contractAddress;
  if (!contractAddress) {
    throw new Error('Contract address not found in the transaction receipt');
  }
  console.log(`Deployed AddTwo.sol contract at ${contractAddress}`);
  return contractAddress;
}

test('renders IncoTest', { timeout: 60000 }, async () => {
  const zap = await Lightning.localNode('testnet');
  const senderPrivKey = zap.deployment.senderPrivateKey as Hex;
  const cfg: E2EConfig = {
    senderPrivKey: senderPrivKey,
    chain: anvil,
    hostChainRpcUrl: 'http://localhost:8545',
  };
  const dappAddress = await deployAddTwo(cfg);
  const { unmount } = render(
    <IncoTest
      chain={anvil}
      pepper="testnet"
      privateKey={senderPrivKey}
      hostChainRpcUrl="http://localhost:8545"
      value={100n}
      addTwoAddress={dappAddress}
    />
  );

  // Assert that the component renders correctly
  expect(screen.getByText('Inco Test')).toBeInTheDocument();

  // Click the button
  const button = screen.getByRole('button', { name: 'Encrypt value' });
  fireEvent.click(button);

  // Wait for and assert the ciphertext appears
  await waitFor(() => {
    expect(screen.getByText(/Ciphertext:/)).toBeInTheDocument();
  });
  
  // Wait for result handle to appear (this happens after transaction is submitted and confirmed)
  await waitFor(
    () => {
      const resultHandleElement = screen.getByTestId('result-handle');
      expect(resultHandleElement).toBeInTheDocument();
      expect(resultHandleElement).toHaveTextContent(/Result handle:/);
    },
    { timeout: 20000 }
  );
  
  const decryptButton = screen.getByRole('button', { name: 'Decrypt result' });
  expect(decryptButton).toBeInTheDocument();
  expect(decryptButton).not.toBeDisabled();
  fireEvent.click(decryptButton);
  await waitFor(
    () => {
      expect(screen.getByText(/Decrypted result:/)).toBeInTheDocument();
    },
    { timeout: 30000 }
  );
  
  // Verify the decrypted result is correct (100 + 2 = 102)
  const decryptedResult = screen.getByTestId('decrypted-result');
  expect(decryptedResult).toHaveTextContent('102');
});  