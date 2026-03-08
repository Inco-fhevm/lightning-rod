import { handleTypes, HexString, parseAddress } from '@inco/js';
import { incoVerifierAbi } from '@inco/js/abis/verifier';
import { AttestedComputeSupportedOps, Lightning } from '@inco/js/lite';
import {
  type Account,
  type Address,
  type Chain,
  createPublicClient,
  createWalletClient,
  getContract,
  type Hex,
  http,
  parseEther,
  toHex,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeAll, describe, expect, it } from 'vitest';
import creditScoreGateBuild from '../../../contracts/out/CreditScoreGate.sol/CreditScoreGate.json';
import { creditScoreGateAbi } from '../generated/abis.js';
import { type E2EConfig, type E2EParams } from './lightning-test.js';

const THRESHOLD = 700n;

export function runCreditScoreGateE2ETest(zap: Lightning, cfg: E2EConfig, params: E2EParams) {
  const { walletClient, publicClient, incoLite } = params;
  const goodScore = 800; // Above threshold
  const badScore = 500;  // Below threshold

  describe('Lightning CreditScoreGate E2E', () => {
    let gateAddress: Address;

    beforeAll(async () => {
      console.warn('###############################################');
      console.warn('# Step 0. Deploy the CreditScoreGate contract');
      console.warn('###############################################');
      gateAddress = await deployCreditScoreGate(cfg);
      console.warn(`CreditScoreGate deployed at ${gateAddress} with threshold=${THRESHOLD}`);
    }, 100_000);

    it('should approve a user with score above threshold via attested compute', async () => {
      // Step 1: Encrypt the credit score
      console.log('###############################################');
      console.log('# Step 1. Encrypt the credit score');
      console.log('###############################################');
      const inputCt = await zap.encrypt(goodScore, {
        accountAddress: walletClient.account.address,
        dappAddress: gateAddress,
        handleType: handleTypes.euint256,
      });
      console.log(`Encrypted credit score ${goodScore}`);

      // Step 2: Store the encrypted score on-chain
      console.log('###############################################');
      console.log('# Step 2. Store the encrypted score on-chain');
      console.log('###############################################');
      const gate = getContract({
        abi: creditScoreGateAbi,
        address: gateAddress,
        client: walletClient,
      });

      const txHash = await gate.write.setCreditScore([inputCt], {
        gas: 500_000n,
        value: parseEther('0.001'),
      });
      console.log(`setCreditScore tx: ${txHash}`);

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`Transaction included in block ${receipt.blockNumber}`);

      // Step 3: Read the handle
      console.log('###############################################');
      console.log('# Step 3. Read the encrypted score handle');
      console.log('###############################################');
      const gateRead = getContract({
        abi: creditScoreGateAbi,
        address: gateAddress,
        client: publicClient,
      });
      const handle = await gateRead.read.getHandle([walletClient.account.address]);
      console.log(`Score handle: ${handle}`);
      expect(handle).not.toBe('0x' + '0'.repeat(64));

      // Step 4: Perform attested compute off-chain (score >= threshold)
      console.log('###############################################');
      console.log('# Step 4. Attested compute: score >= threshold');
      console.log('###############################################');
      const computeResult = await zap.attestedCompute(
        walletClient as any,
        handle as HexString,
        AttestedComputeSupportedOps.Ge,
        THRESHOLD,
      );
      console.log(`Attested compute result: ${computeResult.plaintext.value}`);
      expect(computeResult.plaintext.value).toBe(true);

      // Step 5: Submit attestation on-chain
      console.log('###############################################');
      console.log('# Step 5. Submit attestation on-chain');
      console.log('###############################################');
      const decryption = {
        handle: computeResult.handle as Hex,
        value: toHex(computeResult.plaintext.value ? 1n : 0n, { size: 32 }),
      };
      const signatures = computeResult.covalidatorSignatures.map((s) => toHex(s));
      const submitTxHash = await gate.write.submitCreditCheck(
        [decryption, signatures],
        { gas: 500_000n },
      );
      console.log(`submitCreditCheck tx: ${submitTxHash}`);

      const submitReceipt = await publicClient.waitForTransactionReceipt({ hash: submitTxHash });
      console.log(`Attestation submitted in block ${submitReceipt.blockNumber}`);

      // Step 6: Verify approval
      console.log('###############################################');
      console.log('# Step 6. Verify isApproved');
      console.log('###############################################');
      const approved = await gateRead.read.isApproved([walletClient.account.address]);
      console.log(`isApproved: ${approved}`);
      expect(approved).toBe(true);
    }, 120_000);

    it('should reject a user with score below threshold via attested compute', async () => {
      // Deploy a fresh contract so isApproved starts false
      const freshGate = await deployCreditScoreGate(cfg);

      const inputCt = await zap.encrypt(badScore, {
        accountAddress: walletClient.account.address,
        dappAddress: freshGate,
        handleType: handleTypes.euint256,
      });

      const gate = getContract({
        abi: creditScoreGateAbi,
        address: freshGate,
        client: walletClient,
      });

      const txHash = await gate.write.setCreditScore([inputCt], {
        gas: 500_000n,
        value: parseEther('0.001'),
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      const gateRead = getContract({
        abi: creditScoreGateAbi,
        address: freshGate,
        client: publicClient,
      });
      const handle = await gateRead.read.getHandle([walletClient.account.address]);

      const computeResult = await zap.attestedCompute(
        walletClient as any,
        handle as HexString,
        AttestedComputeSupportedOps.Ge,
        THRESHOLD,
      );
      console.log(`Attested compute result (bad score): ${computeResult.plaintext.value}`);
      expect(computeResult.plaintext.value).toBe(false);

      const decryption = {
        handle: computeResult.handle as Hex,
        value: toHex(computeResult.plaintext.value ? 1n : 0n, { size: 32 }),
      };
      const signatures = computeResult.covalidatorSignatures.map((s) => toHex(s));
      const submitTxHash = await gate.write.submitCreditCheck(
        [decryption, signatures],
        { gas: 500_000n },
      );
      await publicClient.waitForTransactionReceipt({ hash: submitTxHash });

      const approved = await gateRead.read.isApproved([walletClient.account.address]);
      console.log(`isApproved (bad score): ${approved}`);
      expect(approved).toBe(false);
    }, 120_000);
  });
}

async function deployCreditScoreGate(cfg: E2EConfig): Promise<Address> {
  console.log('Deploying CreditScoreGate.sol contract ...');
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
  return parseAddress(contractAddress);
}
