import { expect, test } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AttestedComputeDemoTest from '../src/AttestedComputeDemo.tsx';
import { anvil } from 'viem/chains';
import { Address, createPublicClient, createWalletClient, http, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import attestedComputeDemoBuild from '../../../../../contracts/out/AttestedComputeDemo.sol/AttestedComputeDemo.json';
import { attestedComputeDemoAbi } from '../src/abis.js';
import { fundAccount, E2EConfig } from '../src/test-helpers.js';
import { Lightning } from '@inco/js/lite';

async function deployAttestedComputeDemo(cfg: E2EConfig): Promise<Address> {
  console.log('Deploying AttestedComputeDemo.sol contract ...');
  await fundAccount(cfg.senderPrivKey, cfg.chain, cfg.hostChainRpcUrl);
  const account = privateKeyToAccount(cfg.senderPrivKey);
  const walletClient = createWalletClient({
    chain: cfg.chain,
    transport: http(cfg.hostChainRpcUrl),
  });

  const byteCode = attestedComputeDemoBuild.bytecode.object as Hex;
  const txHash = await walletClient.deployContract({
    account,
    abi: attestedComputeDemoAbi,
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
  console.log(`Deployed AttestedComputeDemo.sol at ${contractAddress}`);
  return contractAddress;
}

test('renders AttestedComputeDemo and runs all operations', { timeout: 180000 }, async () => {
  const zap = await Lightning.localNode('testnet');
  const senderPrivKey = zap.deployment.senderPrivateKey as Hex;
  const cfg: E2EConfig = {
    senderPrivKey,
    chain: anvil,
    hostChainRpcUrl: 'http://localhost:8545',
  };
  const demoAddress = await deployAttestedComputeDemo(cfg);

  // value=42, scalar=50
  // Expected: Eq=false, Ne=true, Ge=false, Gt=false, Le=true, Lt=true
  const { unmount } = render(
    <AttestedComputeDemoTest
      chain={anvil}
      pepper="testnet"
      privateKey={senderPrivKey}
      hostChainRpcUrl="http://localhost:8545"
      value={42n}
      scalar={50n}
      demoAddress={demoAddress}
    />
  );

  expect(screen.getByText('Attested Compute Demo')).toBeInTheDocument();

  // Encrypt the value
  const encryptButton = screen.getByRole('button', { name: 'Encrypt Value' });
  fireEvent.click(encryptButton);

  await waitFor(() => {
    expect(screen.getByText(/Ciphertext:/)).toBeInTheDocument();
  });

  // Wait for handle
  await waitFor(
    () => {
      expect(screen.getByTestId('handle')).toBeInTheDocument();
    },
    { timeout: 30000 }
  );

  // Run all operations
  const runButton = screen.getByRole('button', { name: 'Run All Operations' });
  fireEvent.click(runButton);

  // Wait for results
  await waitFor(
    () => {
      const resultsDiv = screen.getByTestId('results');
      expect(resultsDiv).toBeInTheDocument();
      expect(screen.getByTestId('result-Eq')).toHaveTextContent('false');
      expect(screen.getByTestId('result-Ne')).toHaveTextContent('true');
      expect(screen.getByTestId('result-Ge')).toHaveTextContent('false');
      expect(screen.getByTestId('result-Gt')).toHaveTextContent('false');
      expect(screen.getByTestId('result-Le')).toHaveTextContent('true');
      expect(screen.getByTestId('result-Lt')).toHaveTextContent('true');
    },
    { timeout: 120000 }
  );
});
