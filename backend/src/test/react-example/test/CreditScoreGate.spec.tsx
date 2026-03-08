import { expect, test } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CreditScoreGateTest from '../src/CreditScoreGate.tsx';
import { anvil } from 'viem/chains';
import { Address, createPublicClient, createWalletClient, http, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import creditScoreGateBuild from '../../../../../contracts/out/CreditScoreGate.sol/CreditScoreGate.json';
import { creditScoreGateAbi } from '../src/abis.js';
import { fundAccount, E2EConfig } from '../src/test-helpers.js';
import { Lightning } from '@inco/js/lite';

const THRESHOLD = 700n;

async function deployCreditScoreGate(cfg: E2EConfig): Promise<Address> {
  console.log('Deploying CreditScoreGate.sol contract ...');
  await fundAccount(cfg.senderPrivKey, cfg.chain, cfg.hostChainRpcUrl);
  const account = privateKeyToAccount(cfg.senderPrivKey);
  const walletClient = createWalletClient({
    chain: cfg.chain,
    transport: http(cfg.hostChainRpcUrl),
  });

  const byteCode = creditScoreGateBuild.bytecode.object as Hex;
  const txHash = await walletClient.deployContract({
    account,
    abi: creditScoreGateAbi,
    bytecode: byteCode,
    args: [THRESHOLD],
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
  console.log(`Deployed CreditScoreGate.sol at ${contractAddress}`);
  return contractAddress;
}

test('renders CreditScoreGateTest and processes score above threshold', { timeout: 120000 }, async () => {
  const zap = await Lightning.localNode('testnet');
  const senderPrivKey = zap.deployment.senderPrivateKey as Hex;
  const cfg: E2EConfig = {
    senderPrivKey,
    chain: anvil,
    hostChainRpcUrl: 'http://localhost:8545',
  };
  const gateAddress = await deployCreditScoreGate(cfg);
  const { unmount } = render(
    <CreditScoreGateTest
      chain={anvil}
      pepper="testnet"
      privateKey={senderPrivKey}
      hostChainRpcUrl="http://localhost:8545"
      creditScore={800n}
      gateAddress={gateAddress}
    />
  );

  expect(screen.getByText('Credit Score Gate Test')).toBeInTheDocument();

  // Encrypt the score
  const button = screen.getByRole('button', { name: 'Encrypt Score' });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(/Ciphertext:/)).toBeInTheDocument();
  });

  // Wait for score handle
  await waitFor(
    () => {
      const handleElement = screen.getByTestId('score-handle');
      expect(handleElement).toBeInTheDocument();
      expect(handleElement).toHaveTextContent(/Score Handle:/);
    },
    { timeout: 30000 }
  );

  // Click attested compute
  const checkButton = screen.getByRole('button', { name: 'Check Credit Score' });
  expect(checkButton).toBeInTheDocument();
  expect(checkButton).not.toBeDisabled();
  fireEvent.click(checkButton);

  // Wait for approval result
  await waitFor(
    () => {
      expect(screen.getByTestId('compute-result')).toHaveTextContent('Yes');
      expect(screen.getByTestId('is-approved')).toHaveTextContent('Yes');
    },
    { timeout: 60000 }
  );
});
