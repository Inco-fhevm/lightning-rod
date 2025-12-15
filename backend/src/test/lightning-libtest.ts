import { handleTypes, HexString, parseAddress } from '@inco/js';
import { incoVerifierAbi } from '@inco/js/abis/verifier';
import { encryptionSchemes } from '@inco/js/encryption';
import { Lightning } from '@inco/js/lite';
import {
  type Address,
  type Chain,
  createPublicClient,
  createWalletClient,
  getContract,
  type Hex,
  http,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeAll, describe, expect, it } from 'vitest';
import libTestBuild from '../../../contracts/out/LibTest.sol/LibTest.json';
import { libTestAbi } from '../generated/abis.js';
import { type E2EConfig } from './lightning-test.js';

import type { E2EParams } from './lightning-test.js';

// Deploys the LibTest.sol contract on the host chain.
async function deployLibTest(cfg: E2EConfig): Promise<Address> {
  console.log();
  console.log(`Deploying LibTest.sol contract ...`);
  await fundAccount(cfg.senderPrivKey, cfg.chain, cfg.hostChainRpcUrl);
  const account = privateKeyToAccount(cfg.senderPrivKey);
  const walletClient = createWalletClient({
    chain: cfg.chain,
    transport: http(cfg.hostChainRpcUrl),
  });

  const byteCode = libTestBuild.bytecode.object as Hex;
  const txHash = await walletClient.deployContract({
    account,
    abi: libTestAbi,
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
  console.log(`Deployed LibTest.sol contract at ${contractAddress}`);
  return parseAddress(contractAddress);
}

async function fundAccount(senderPrivKey: Hex, chain: Chain, hostChainRpcUrl: string) {
  const richAccount = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
  const account = privateKeyToAccount(senderPrivKey);
  const richWalletClient = createWalletClient({
    chain,
    transport: http(hostChainRpcUrl),
  });
  await richWalletClient.sendTransaction({
    account: richAccount,
    to: account.address,
    value: parseEther('1'),
  });
}

export function runLibTestE2ETest(zap: Lightning, cfg: E2EConfig,params: E2EParams) {
  const { walletClient, publicClient, incoLite } = params;

  describe('Lightning LibTest E2E', () => {
    let libTestAddress: Address;
    let libTest: any;
    let handleA: HexString;
    let handleB: HexString;
    let handleC: HexString;
    let handleTrue: HexString;
    let handleFalse: HexString;
    let handleAddress: HexString;

    beforeAll(async () => {
      console.warn('###############################################');
      console.warn(`# Step 0. Deploy the LibTest contract`);
      console.warn('###############################################');
      libTestAddress = await deployLibTest(cfg);
      console.warn(`LibTest contract deployed at ${libTestAddress}`);
      console.warn('Running this test has some prerequisites:');
      console.warn(`- The IncoLite contract ${zap.executorAddress} must be deployed on ${cfg.chain.name}`);
      console.warn(`- The dapp contract ${libTestAddress} must be deployed on ${cfg.chain.name}`);
      console.warn(
        `- The sender ${privateKeyToAccount(cfg.senderPrivKey).address} must have some ${cfg.chain.name} tokens`,
      );

      const incoVerifierAddress = await incoLite.read.incoVerifier();
      const incoVerifier = getContract({
        abi: incoVerifierAbi,
        address: incoVerifierAddress,
        client: publicClient,
      });

      libTest = getContract({
        abi: libTestAbi,
        address: libTestAddress,
        client: walletClient,
      });

      // Helper function to create euint256 handle
      async function createEuint256Handle(value: number): Promise<HexString> {
        const inputCt = await zap.encrypt(
          value,
          {
            accountAddress: walletClient.account.address,
            dappAddress: libTestAddress,
            handleType: handleTypes.euint256,
          },
        );
        const handleSim = await libTest.simulate.testNewEuint256([inputCt, walletClient.account.address], {
          value: parseEther('0.0001'),
        });
        await libTest.write.testNewEuint256([inputCt, walletClient.account.address], {
          value: parseEther('0.0001'),
        });
        return handleSim.result as HexString;
      }

      // Helper function to create ebool handle
      async function createEboolHandle(value: boolean): Promise<HexString> {
        const inputCt = await zap.encrypt(
          value,
          {
            accountAddress: walletClient.account.address,
            dappAddress: libTestAddress,
            handleType: handleTypes.ebool,
          },
        );
        const handleSim = await libTest.simulate.testNewEbool([inputCt, walletClient.account.address], {
          value: parseEther('0.0001'),
        });
        await libTest.write.testNewEbool([inputCt, walletClient.account.address], {
          value: parseEther('0.0001'),
        });
        return handleSim.result as HexString;
      }

      // Helper function to create eaddress handle
      async function createEaddressHandle(address: Address): Promise<HexString> {
        const ct = await zap.encrypt(
          BigInt(address),
          {
            accountAddress: walletClient.account.address,
            dappAddress: libTestAddress,
            handleType: handleTypes.euint160,
          },
        );
        const handleSim = await libTest.simulate.testNewEaddress([ct, walletClient.account.address], {
          value: parseEther('0.0001'),
        });
        await libTest.write.testNewEaddress([ct, walletClient.account.address], {
          value: parseEther('0.0001'),
        });
        return handleSim.result as HexString;
      }

      // Create 3 numeric handles and 2 boolean handles
      console.warn('Creating handles in beforeAll...');
      handleA = await createEuint256Handle(10);
      handleB = await createEuint256Handle(5);
      handleC = await createEuint256Handle(15);
      handleTrue = await createEboolHandle(true);
      handleFalse = await createEboolHandle(false);
      handleAddress = await createEaddressHandle(walletClient.account.address);
      console.warn('All handles created successfully');
    }, 100_000);

    // Arithmetic Operations Tests
    describe('Arithmetic Operations', () => {
      it('should test addition with stored handles', async () => {
        const sim = await libTest.simulate.testAdd([handleA, handleB]);
        const txHash = await libTest.write.testAdd([handleA, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(15));
      }, 20_000);

      it('should test addition with scalar value using stored A', async () => {
        const b = 3;
        const sim = await libTest.simulate.testAddScalar([handleA, BigInt(b)]);
        const txHash = await libTest.write.testAddScalar([handleA, BigInt(b)]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(13));
      }, 20_000);

      it('should test subtraction with stored handles', async () => {
        const sim = await libTest.simulate.testSub([handleA, handleB]);
        const txHash = await libTest.write.testSub([handleA, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(5));
      }, 20_000);

      it('should test multiplication with stored handles', async () => {
        const sim = await libTest.simulate.testMul([handleA, handleB]);
        const txHash = await libTest.write.testMul([handleA, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(50));
      }, 20_000);

      it('should test division with stored handles', async () => {
        const sim = await libTest.simulate.testDiv([handleA, handleB]);
        const txHash = await libTest.write.testDiv([handleA, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await (zap as any).attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(2));
      }, 20_000);

      it('should test remainder with stored handles', async () => {
        const sim = await libTest.simulate.testRem([handleA, handleB]);
        const txHash = await libTest.write.testRem([handleA, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await (zap as any).attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr?.[0]?.plaintext?.value ?? decryptedArr?.[0]?.value;
        expect(value).toBeDefined();
      }, 20_000);
    });

    // Bitwise Operations Tests
    describe('Bitwise Operations', () => {
      it('should test AND operation with stored handles', async () => {
        const sim = await libTest.simulate.testAnd([handleA, handleB]);
        const txHash = await libTest.write.testAnd([handleA, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(0));
      }, 20_000);

      it('should test OR operation with stored handles', async () => {
        const sim = await libTest.simulate.testOr([handleA, handleB]);
        const txHash = await libTest.write.testOr([handleA, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(15));
      }, 20_000);

      it('should test XOR operation with stored handles', async () => {
        const sim = await libTest.simulate.testXor([handleA, handleB]);
        const txHash = await libTest.write.testXor([handleA, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(15));
      }, 20_000);

      it('should test left shift with stored handles', async () => {
        const sim = await libTest.simulate.testShl([handleA, handleB]);
        const txHash = await libTest.write.testShl([handleA, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(320));
      }, 20_000);

      it('should test right shift with stored handles', async () => {
        const sim = await libTest.simulate.testShr([handleC, handleB]);
        const txHash = await libTest.write.testShr([handleC, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(0));
      }, 20_000);
    });

    // Comparison Operations Tests
    describe('Comparison Operations', () => {
      it('should test equality with stored handles', async () => {
        const sim = await libTest.simulate.testEq([handleC, handleC]);
        const txHash = await libTest.write.testEq([handleC, handleC]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(true);
      }, 20_000);

      it('should test inequality with stored handles', async () => {
        const sim = await libTest.simulate.testNe([handleC, handleA]);
        const txHash = await libTest.write.testNe([handleC, handleA]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await (zap as any).attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr?.[0]?.plaintext?.value ?? decryptedArr?.[0]?.value;
        expect(value).toBe(true);
      }, 20_000);

      it('should test greater than with stored handles', async () => {
        const sim = await libTest.simulate.testGt([handleC, handleB]);
        const txHash = await libTest.write.testGt([handleC, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(true);
      }, 20_000);

      it('should test less than with stored handles', async () => {
        const sim = await libTest.simulate.testLt([handleA, handleC]);
        const txHash = await libTest.write.testLt([handleA, handleC]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(true);
      }, 20_000);

      it('should test min with stored handles', async () => {
        const sim = await libTest.simulate.testMin([handleC, handleA]);
        const txHash = await libTest.write.testMin([handleC, handleA]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(10));
      }, 20_000);

      it('should test max with stored handles', async () => {
        const sim = await libTest.simulate.testMax([handleC, handleA]);
        const txHash = await libTest.write.testMax([handleC, handleA]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(15));
      }, 20_000);
    });

    // Logical Operations Tests
    describe('Logical Operations', () => {
      it('should test NOT operation with stored boolean handle', async () => {
        const sim = await libTest.simulate.testNot([handleTrue]);
        const txHash = await libTest.write.testNot([handleTrue]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(false); // false (NOT true)
      }, 20_000);
    });

    // Random Number Generation Tests
    describe('Random Number Generation', () => {
      it('should test random number generation', async () => {
        const sim = await libTest.simulate.testRand({ value: parseEther('0.0001') });
        const txHash = await libTest.write.testRand({ value: parseEther('0.0001') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        // Random number should be a valid uint256 (0 to 2^256-1)
        expect(value).toBeGreaterThanOrEqual(BigInt(0));
        expect(value).toBeLessThan(BigInt(2) ** BigInt(256));
      }, 20_000);

      it('should test bounded random number generation', async () => {
        const upperBound = 100;
        const sim = await libTest.simulate.testRandBounded([BigInt(upperBound)], { value: parseEther('0.0001') });
        const txHash = await libTest.write.testRandBounded([BigInt(upperBound)], { value: parseEther('0.0001') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        // Random number should be within bounds
        expect(value).toBeGreaterThanOrEqual(BigInt(0));
        expect(value).toBeLessThan(BigInt(upperBound));
      }, 20_000);
    });

    // Additional Bitwise Operations Tests
    describe('Additional Bitwise Operations', () => {
      it('should test rotation left with stored handles', async () => {
        const sim = await libTest.simulate.testRotl([handleB, handleB]);
        const txHash = await libTest.write.testRotl([handleB, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(160));
      }, 20_000);

      it('should test rotation right with stored handles', async () => {
        const sim = await libTest.simulate.testRotr([handleB, handleB]);
        const txHash = await libTest.write.testRotr([handleB, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(18092513943330655534932966407607485602073435104006338131165247501236426506240n);
      }, 20_000);

      it('should test AND operation with stored boolean handles', async () => {
        const sim = await libTest.simulate.testAndBool([handleTrue, handleFalse]);
        const txHash = await libTest.write.testAndBool([handleTrue, handleFalse]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(false); // false (true AND false)
      }, 20_000);

      it('should test OR operation with stored boolean handles', async () => {
        const sim = await libTest.simulate.testOrBool([handleTrue, handleFalse]);
        const txHash = await libTest.write.testOrBool([handleTrue, handleFalse]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(true); // true (true OR false)
      }, 20_000);

      it('should test XOR operation with stored boolean handles', async () => {
        const sim = await libTest.simulate.testXorBool([handleTrue, handleTrue]);
        const txHash = await libTest.write.testXorBool([handleTrue, handleTrue]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(false); // false (true XOR true)
      }, 20_000);
    });

    // Additional Comparison Operations Tests
    describe('Additional Comparison Operations', () => {
      it('should test greater than or equal with stored handles', async () => {
        const sim = await libTest.simulate.testGe([handleC, handleC]);
        const txHash = await libTest.write.testGe([handleC, handleC]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBeDefined();
      }, 20_000);

      it('should test less than or equal with stored handles', async () => {
        const sim = await libTest.simulate.testLe([handleC, handleA]);
        const txHash = await libTest.write.testLe([handleC, handleA]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBeDefined();
      }, 20_000);

      it('should test equality with scalar value', async () => {
        const sim = await libTest.simulate.testEqScalar([handleC, BigInt(15)]);
        const txHash = await libTest.write.testEqScalar([handleC, BigInt(15)]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBeDefined();
      }, 20_000);

      it('should test inequality with scalar value', async () => {
        const sim = await libTest.simulate.testNeScalar([handleC, BigInt(20)]);
        const txHash = await libTest.write.testNeScalar([handleC, BigInt(20)]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBeDefined();
      }, 20_000);
    });
    describe('Reveal Operations', () => {
      it('should test reveal uint256', async () => {
        const sim = await libTest.simulate.testRevealEUint([handleA]);
        const txHash = await libTest.write.testRevealEUint([handleA]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [handleA]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(10));
      }, 20_000);
      it('should test reveal bool', async () => {
        const sim = await libTest.simulate.testRevealEBool([handleTrue]);
        const txHash = await libTest.write.testRevealEBool([handleTrue]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [handleTrue]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(true);
      }, 20_000);
      it('should test reveal address', async () => {
        // Note: sim.result is undefined because testRevealEAddress returns void (no outputs)
        // The reveal function just reveals the value on-chain but doesn't return a handle
        const sim = await libTest.simulate.testRevealEAddress([handleAddress]);
        const txHash = await libTest.write.testRevealEAddress([handleAddress]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        // After revealing, we decrypt the original handle to verify the value
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [handleAddress]);
        const value = decryptedArr[0]?.plaintext.value;
        // Convert address to BigInt - use the same conversion as in createEaddressHandle
        const expectedAddressValue = BigInt(walletClient.account.address);
        expect(value).toBe(expectedAddressValue);
      }, 20_000);
    });
  });
}

