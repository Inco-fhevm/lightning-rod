import { handleTypes, HexString, parseAddress } from '@inco/js';
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
import attestedComputeDemoBuild from '../../../contracts/out/AttestedComputeDemo.sol/AttestedComputeDemo.json';
import { attestedComputeDemoAbi } from '../generated/abis.js';
import { type E2EConfig, type E2EParams } from './lightning-test.js';

// Map SDK ops to on-chain op constants
const OP_MAP: Record<string, { sdkOp: (typeof AttestedComputeSupportedOps)[keyof typeof AttestedComputeSupportedOps]; chainOp: number }> = {
  Eq: { sdkOp: AttestedComputeSupportedOps.Eq, chainOp: 0 },
  Ne: { sdkOp: AttestedComputeSupportedOps.Ne, chainOp: 1 },
  Ge: { sdkOp: AttestedComputeSupportedOps.Ge, chainOp: 2 },
  Gt: { sdkOp: AttestedComputeSupportedOps.Gt, chainOp: 3 },
  Le: { sdkOp: AttestedComputeSupportedOps.Le, chainOp: 4 },
  Lt: { sdkOp: AttestedComputeSupportedOps.Lt, chainOp: 5 },
};

export function runAttestedComputeDemoE2ETest(zap: Lightning, cfg: E2EConfig, params: E2EParams) {
  const { walletClient, publicClient } = params;
  const encryptedValue = 42;
  const comparisonScalar = 50n;

  describe('Lightning AttestedComputeDemo E2E', () => {
    let demoAddress: Address;

    beforeAll(async () => {
      console.warn('###############################################');
      console.warn('# Deploy the AttestedComputeDemo contract');
      console.warn('###############################################');
      demoAddress = await deployAttestedComputeDemo(cfg);
      console.warn(`AttestedComputeDemo deployed at ${demoAddress}`);

      // Store encrypted value
      const inputCt = await zap.encrypt(encryptedValue, {
        accountAddress: walletClient.account.address,
        dappAddress: demoAddress,
        handleType: handleTypes.euint256,
      });

      const demo = getContract({
        abi: attestedComputeDemoAbi,
        address: demoAddress,
        client: walletClient,
      });

      const txHash = await demo.write.setEncryptedValue([inputCt], {
        gas: 500_000n,
        value: parseEther('0.001'),
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.warn(`Encrypted value ${encryptedValue} stored on-chain`);
    }, 100_000);

    // Test each operation: value=42, scalar=50
    // Expected: Eq=false, Ne=true, Ge=false, Gt=false, Le=true, Lt=true
    const expectations: Record<string, boolean> = {
      Eq: false,  // 42 == 50 → false
      Ne: true,   // 42 != 50 → true
      Ge: false,  // 42 >= 50 → false
      Gt: false,  // 42 > 50  → false
      Le: true,   // 42 <= 50 → true
      Lt: true,   // 42 < 50  → true
    };

    for (const [opName, expected] of Object.entries(expectations)) {
      const { sdkOp, chainOp } = OP_MAP[opName]!;

      it(`should verify ${opName} operation (${encryptedValue} ${opName} ${comparisonScalar} = ${expected})`, async () => {
        const demoRead = getContract({
          abi: attestedComputeDemoAbi,
          address: demoAddress,
          client: publicClient,
        });

        // Read handle
        const handle = await demoRead.read.getHandle([walletClient.account.address]);
        expect(handle).not.toBe('0x' + '0'.repeat(64));

        // Attested compute off-chain
        const computeResult = await zap.attestedCompute(
          walletClient as any,
          handle as HexString,
          sdkOp,
          comparisonScalar,
        );
        console.log(`${opName}: plaintext = ${computeResult.plaintext.value}`);
        expect(computeResult.plaintext.value).toBe(expected);

        // Submit attestation on-chain
        const demo = getContract({
          abi: attestedComputeDemoAbi,
          address: demoAddress,
          client: walletClient,
        });
        const decryption = {
          handle: computeResult.handle as Hex,
          value: toHex(computeResult.plaintext.value ? 1n : 0n, { size: 32 }),
        };
        const signatures = computeResult.covalidatorSignatures.map((s) => toHex(s));
        const submitTxHash = await demo.write.submitAttestation(
          [chainOp, comparisonScalar, decryption, signatures],
          { gas: 500_000n },
        );
        await publicClient.waitForTransactionReceipt({ hash: submitTxHash });

        // Verify on-chain result
        const result = await demoRead.read.results([
          walletClient.account.address,
          chainOp,
          comparisonScalar,
        ]);
        expect(result).toBe(expected);

        const has = await demoRead.read.hasResult([
          walletClient.account.address,
          chainOp,
          comparisonScalar,
        ]);
        expect(has).toBe(true);
      }, 60_000);
    }
  });
}

async function deployAttestedComputeDemo(cfg: E2EConfig): Promise<Address> {
  console.log('Deploying AttestedComputeDemo.sol contract ...');
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
  return parseAddress(contractAddress);
}
