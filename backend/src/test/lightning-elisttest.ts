import { handleTypes, parseAddress } from '@inco/js';
import { incoLightningAbi, Lightning } from '@inco/js/lite';
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
import elistTestBuild from '../../../contracts/out/ElistTest.sol/ElistTest.json';
import { elistTestAbi } from '../generated/abis.js';
import { type E2EConfig } from './lightning-test.js';

import type { E2EParams } from './lightning-test.js';

// Deploys the ElistTest.sol contract on the host chain.
async function deployElistTest(cfg: E2EConfig): Promise<Address> {
  console.log();
  console.log(`Deploying ElistTest.sol contract ...`);
  const account = privateKeyToAccount(cfg.senderPrivKey);
  const walletClient = createWalletClient({
    chain: cfg.chain,
    transport: http(cfg.hostChainRpcUrl),
  });

  const byteCode = elistTestBuild.bytecode.object as Hex;
  const txHash = await walletClient.deployContract({
    account,
    abi: elistTestAbi,
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
  console.log(`Deployed ElistTest.sol contract at ${contractAddress}`);
  return parseAddress(contractAddress);
}


export function runElistTestE2ETest(zap: Lightning, cfg: E2EConfig, params: E2EParams) {
  const { walletClient, publicClient } = params;

  describe('Lightning ElistTest E2E', () => {
    let elistTestAddress: Address;
    let elistTest: any;

    beforeAll(async () => {
      console.warn('###############################################');
      console.warn(`# Step 0. Deploy the ElistTest contract`);
      console.warn('###############################################');
      elistTestAddress = await deployElistTest(cfg);
      console.warn(`ElistTest contract deployed at ${elistTestAddress}`);
      console.warn('Running this test has some prerequisites:');
      console.warn(`- The IncoLite contract ${zap.executorAddress} must be deployed on ${cfg.chain.name}`);
      console.warn(`- The dapp contract ${elistTestAddress} must be deployed on ${cfg.chain.name}`);
      console.warn(
        `- The sender ${privateKeyToAccount(cfg.senderPrivKey).address} must have some ${cfg.chain.name} tokens`,
      );

      elistTest = getContract({
        abi: elistTestAbi,
        address: elistTestAddress,
        client: walletClient,
      });
    }, 100_000);

    describe('List Creation', () => {
      it('should create a new list from ciphertexts', async () => {
        const values = [1, 2, 3];
        const inputCts = [];
        for (const value of values) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.euint256,
          });
          inputCts.push(ct);
        }

        const sim = await elistTest.simulate.newEList([inputCts, handleTypes.euint256, walletClient.account.address], {
          value: parseEther('0.0003'),
        });
        const txHash = await elistTest.write.newEList([inputCts, handleTypes.euint256, walletClient.account.address], {
          value: parseEther('0.0003'),
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        expect(sim.result).toBeDefined();
        console.log('Created list handle:', sim.result);
      }, 60_000);

      it('should get element from list at index', async () => {
        const sim = await elistTest.simulate.listGet([0]);
        const txHash = await elistTest.write.listGet([0]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(1));
      }, 30_000);
    });

    describe('List Append', () => {
      it('should append element to list', async () => {
        const ct = await zap.encrypt(4, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });

        const sim = await elistTest.simulate.listAppend([ct], { value: parseEther('0.0001') });
        const txHash = await elistTest.write.listAppend([ct], { value: parseEther('0.0001') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        expect(sim.result).toBeDefined();

        // Verify the appended element
        const getSim = await elistTest.simulate.listGet([3]);
        const getTxHash = await elistTest.write.listGet([3]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(4));
      }, 60_000);
    });

    describe('List GetOr', () => {
      it('should get element or default value', async () => {
        const ctIndex = await zap.encrypt(1, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });
        const ctDefault = await zap.encrypt(999, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });

        const sim = await elistTest.simulate.listGetOr([ctIndex, ctDefault], { value: parseEther('0.0002') });
        const txHash = await elistTest.write.listGetOr([ctIndex, ctDefault], { value: parseEther('0.0002') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(2)); // Index 1 should be value 2
      }, 60_000);
    });

    describe('List Set', () => {
      it('should set element at index', async () => {
        // Create a fresh list first with unique values
        const listValues = [111, 222, 333];
        const listCts = [];
        for (const v of listValues) {
          const ct = await zap.encrypt(v, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.euint256,
          });
          listCts.push(ct);
        }
        const createTxHash = await elistTest.write.newEList(
          [listCts, handleTypes.euint256, walletClient.account.address],
          { value: parseEther('0.0003') },
        );
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        // Now set index 0 to 999
        const ctIndex = await zap.encrypt(0, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });
        const ctValue = await zap.encrypt(999, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });

        const sim = await elistTest.simulate.listSet([ctIndex, ctValue], { value: parseEther('0.0002') });
        const txHash = await elistTest.write.listSet([ctIndex, ctValue], { value: parseEther('0.0002') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
        expect(sim.result).toBeDefined();
        // Verify the set element
        const getSim = await elistTest.simulate.listGet([0]);
        const getTxHash = await elistTest.write.listGet([0]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(999));
      }, 90_000);
    });

    describe('List Insert', () => {
      it('should insert element at index', async () => {
        const ctIndex = await zap.encrypt(1, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });
        const ctValue = await zap.encrypt(50, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });

        const sim = await elistTest.simulate.listInsert([ctIndex, ctValue], { value: parseEther('0.0002') });
        const txHash = await elistTest.write.listInsert([ctIndex, ctValue], { value: parseEther('0.0002') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        expect(sim.result).toBeDefined();
      }, 60_000);
    });

    describe('List Range', () => {
      it('should create a range list', async () => {
        const sim = await elistTest.simulate.listRange([0, 5]);
        const txHash = await elistTest.write.listRange([0, 5]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        expect(sim.result).toBeDefined();

        // Verify range element
        const getSim = await elistTest.simulate.listGetRange([2]);
        const getTxHash = await elistTest.write.listGetRange([2]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(2));
      }, 60_000);
    });

    describe('List Concat', () => {
      it('should concatenate lists', async () => {
        const values = [10, 20];
        const inputCts = [];
        for (const value of values) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.euint256,
          });
          inputCts.push(ct);
        }

        const sim = await elistTest.simulate.listConcat(
          [inputCts, handleTypes.euint256, walletClient.account.address],
          { value: parseEther('0.0002') },
        );
        const txHash = await elistTest.write.listConcat(
          [inputCts, handleTypes.euint256, walletClient.account.address],
          { value: parseEther('0.0002') },
        );
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        expect(sim.result).toBeDefined();
      }, 60_000);
    });

    describe('List Shuffle', () => {
      it('should shuffle list and change element positions', async () => {
        // Create a fresh list with unique values
        const values = [100, 200, 300, 400, 500];
        const inputCts = [];
        for (const value of values) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.euint256,
          });
          inputCts.push(ct);
        }

        const createTxHash = await elistTest.write.newEList(
          [inputCts, handleTypes.euint256, walletClient.account.address],
          { value: parseEther('0.0005') },
        );
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        // Get all elements before shuffle
        const valuesBefore: bigint[] = [];
        for (let i = 0; i < values.length; i++) {
          const getSim = await elistTest.simulate.listGet([i]);
          const getTxHash = await elistTest.write.listGet([i]);
          await publicClient.waitForTransactionReceipt({ hash: getTxHash });

          const decrypted = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
          valuesBefore.push(decrypted[0]?.plaintext.value as bigint);
        }
        console.log('Elements before shuffle:', valuesBefore);

        // Shuffle the list
        const sim = await elistTest.simulate.listShuffle([], { value: parseEther('0.0001') });
        const txHash = await elistTest.write.listShuffle([], { value: parseEther('0.0001') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        console.log('Shuffled list handle:', sim.result);
        expect(sim.result).toBeDefined();

        // Get all elements after shuffle
        const valuesAfter: bigint[] = [];
        for (let i = 0; i < values.length; i++) {
          const getSim = await elistTest.simulate.listGet([i]);
          const getTxHash = await elistTest.write.listGet([i]);
          await publicClient.waitForTransactionReceipt({ hash: getTxHash });

          const decrypted = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
          valuesAfter.push(decrypted[0]?.plaintext.value as bigint);
        }
        console.log('Elements after shuffle:', valuesAfter);

        // Verify all original values are still present (just reordered)
        for (const val of values) {
          expect(valuesAfter).toContain(BigInt(val));
        }

        // Check if at least one element changed position
        let positionChanged = false;
        for (let i = 0; i < values.length; i++) {
          if (valuesBefore[i] !== valuesAfter[i]) {
            positionChanged = true;
            break;
          }
        }

        expect(positionChanged).toBe(true);
        console.log('At least one element changed position:', positionChanged);
      }, 320_000);
    });

    describe('List Reverse', () => {
      it('should reverse list', async () => {
        // Create a fresh list with unique values (different from other tests)
        const values = [11, 22, 33];
        const inputCts = [];
        for (const value of values) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.euint256,
          });

          const incoLightning = getContract({
            abi: incoLightningAbi,
            address: zap.executorAddress,
            client: walletClient,
          });
          incoLightning.read.getFee();
          inputCts.push(ct);
        }

        const createTxHash = await elistTest.write.newEList(
          [inputCts, handleTypes.euint256, walletClient.account.address],
          { value: parseEther('0.0003') },
        );
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        const sim = await elistTest.simulate.listReverse();
        const txHash = await elistTest.write.listReverse();
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        expect(sim.result).toBeDefined();

        // After reversing [11,22,33], index 0 should be 33
        const getSim = await elistTest.simulate.listGet([0]);
        const getTxHash = await elistTest.write.listGet([0]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(33));
      }, 120_000);
    });

    describe('List Slice', () => {
      it('should slice list with encrypted indices', async () => {
        // First create a list
        const values = [1, 2, 3, 4, 5];
        const inputCts = [];
        for (const value of values) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.euint256,
          });
          inputCts.push(ct);
        }

        await elistTest.write.newEList([inputCts, handleTypes.euint256, walletClient.account.address], {
          value: parseEther('0.0005'),
        });

        const ctStart = await zap.encrypt(1, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });
        const ctDefault = await zap.encrypt(0, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });

        const sim = await elistTest.simulate.listSlice([ctStart, 3, ctDefault], { value: parseEther('0.0002') });
        const txHash = await elistTest.write.listSlice([ctStart, 3, ctDefault], { value: parseEther('0.0002') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        expect(sim.result).toBeDefined();
      }, 120_000);

      it('should slice list with plain indices', async () => {
        // First create a fresh list with 5 elements
        const values = [10, 20, 30, 40, 50];
        const inputCts = [];
        for (const value of values) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.euint256,
          });
          inputCts.push(ct);
        }

        const createTxHash = await elistTest.write.newEList(
          [inputCts, handleTypes.euint256, walletClient.account.address],
          { value: parseEther('0.0005') },
        );
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        const sim = await elistTest.simulate.listSlice([1, 4]);
        const txHash = await elistTest.write.listSlice([1, 4]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        expect(sim.result).toBeDefined();

        // Verify first element of slice (should be 20)
        const getSim = await elistTest.simulate.listGet([0]);
        const getTxHash = await elistTest.write.listGet([0]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(20));
      }, 120_000);
    });

    describe('Utility Functions', () => {
      it('should create empty list and check type and length', async () => {
        const createTxHash = await elistTest.write.newEmptyEList([handleTypes.euint256]);
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        // Check type
        const typeSim = await elistTest.simulate.listTypeOf();
        expect(typeSim.result).toBe(handleTypes.euint256);

        // Check length is 0
        const lengthSim = await elistTest.simulate.listLength();
        expect(lengthSim.result).toBe(0);
      }, 60_000);

      it('should check list type after creation', async () => {
        const values = [1, 2, 3];
        const inputCts = [];
        for (const value of values) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.euint256,
          });
          inputCts.push(ct);
        }

        const txHash = await elistTest.write.newEList([inputCts, handleTypes.euint256, walletClient.account.address], {
          value: parseEther('0.0003'),
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        const typeSim = await elistTest.simulate.listTypeOf();
        expect(typeSim.result).toBe(handleTypes.euint256);

        const lengthSim = await elistTest.simulate.listLength();
        expect(lengthSim.result).toBe(3);
      }, 60_000);
    });

    describe('List Set with uint16 Index', () => {
      it('should set element at plain index', async () => {
        const values = [100, 200, 300];
        const inputCts = [];
        for (const value of values) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.euint256,
          });
          inputCts.push(ct);
        }

        const createTxHash = await elistTest.write.newEList(
          [inputCts, handleTypes.euint256, walletClient.account.address],
          { value: parseEther('0.0003') },
        );
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        const ctValue = await zap.encrypt(777, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });

        const txHash = await elistTest.write.listSetUint16Index([1, ctValue], { value: parseEther('0.0001') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        // Verify the set element
        const getSim = await elistTest.simulate.listGet([1]);
        const getTxHash = await elistTest.write.listGet([1]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(777));
      }, 90_000);
    });

    describe('List Insert with uint16 Index', () => {
      it('should insert element at plain index', async () => {
        const values = [100, 300];
        const inputCts = [];
        for (const value of values) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.euint256,
          });
          inputCts.push(ct);
        }

        await elistTest.write.newEList([inputCts, handleTypes.euint256, walletClient.account.address], {
          value: parseEther('0.0002'),
        });

        const ctValue = await zap.encrypt(200, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });

        const txHash = await elistTest.write.listInsertUint16Index([1, ctValue], { value: parseEther('0.0001') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        // Verify the inserted element
        const getSim = await elistTest.simulate.listGet([1]);
        const getTxHash = await elistTest.write.listGet([1]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(200));
      }, 90_000);
    });

    describe('Shuffled Range', () => {
      it('should create a shuffled range list', async () => {
        const sim = await elistTest.simulate.listShuffledRange([0, 10], { value: parseEther('0.0001') });
        const txHash = await elistTest.write.listShuffledRange([0, 10], { value: parseEther('0.0001') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        expect(sim.result).toBeDefined();

        // Verify we can get an element
        const getSim = await elistTest.simulate.listGetRange([0]);
        const getTxHash = await elistTest.write.listGetRange([0]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBeGreaterThanOrEqual(BigInt(0));
        expect(value).toBeLessThan(BigInt(10));
      }, 60_000);
    });

    describe('Bool List Operations', () => {
      it('should create bool list and append', async () => {
        const boolValues = [true, false, true];
        const inputCts = [];
        for (const value of boolValues) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.ebool,
          });
          inputCts.push(ct);
        }

        const createTxHash = await elistTest.write.newBoolList([inputCts, walletClient.account.address], {
          value: parseEther('0.0003'),
        });
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        // Append another bool
        const ctBool = await zap.encrypt(false, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.ebool,
        });

        const appendTxHash = await elistTest.write.boolListAppend([ctBool], { value: parseEther('0.0001') });
        await publicClient.waitForTransactionReceipt({ hash: appendTxHash });

        // Get first element
        const getSim = await elistTest.simulate.boolListGet([0]);
        const getTxHash = await elistTest.write.boolListGet([0]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(true);
      }, 90_000);

      it('should set bool element at index', async () => {
        const boolValues = [true, false, true];
        const inputCts = [];
        for (const value of boolValues) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.ebool,
          });
          inputCts.push(ct);
        }

        const createTxHash = await elistTest.write.newBoolList([inputCts, walletClient.account.address], {
          value: parseEther('0.0003'),
        });
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        const ctValue = await zap.encrypt(false, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.ebool,
        });

        const txHash = await elistTest.write.boolListSet([2, ctValue], { value: parseEther('0.0001') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        // Verify the set element
        const getSim = await elistTest.simulate.boolListGet([2]);
        const getTxHash = await elistTest.write.boolListGet([2]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(false);
      }, 90_000);

      it('should set bool element at encrypted index', async () => {
        const boolValues = [true, false, true];
        const inputCts = [];
        for (const value of boolValues) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.ebool,
          });
          inputCts.push(ct);
        }

        const createTxHash = await elistTest.write.newBoolList([inputCts, walletClient.account.address], {
          value: parseEther('0.0003'),
        });
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        const ctIndex = await zap.encrypt(1, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });

        const ctValue = await zap.encrypt(true, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.ebool,
        });

        const txHash = await elistTest.write.boolListSetEncryptedIndex([ctIndex, ctValue], {
          value: parseEther('0.0002'),
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        // Verify the set element
        const getSim = await elistTest.simulate.boolListGet([1]);
        const getTxHash = await elistTest.write.boolListGet([1]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(true);
      }, 90_000);

      it('should get bool element or default', async () => {
        const boolValues = [true, true];
        const inputCts = [];
        for (const value of boolValues) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.ebool,
          });
          inputCts.push(ct);
        }

        const createTxHash = await elistTest.write.newBoolList([inputCts, walletClient.account.address], {
          value: parseEther('0.0002'),
        });
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        const ctIndex = await zap.encrypt(0, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });

        const ctDefault = await zap.encrypt(false, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.ebool,
        });

        const sim = await elistTest.simulate.boolListGetOr([ctIndex, ctDefault], { value: parseEther('0.0002') });
        const txHash = await elistTest.write.boolListGetOr([ctIndex, ctDefault], { value: parseEther('0.0002') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(true);
      }, 90_000);

      it('should insert bool element at plain index', async () => {
        const boolValues = [true, true];
        const inputCts = [];
        for (const value of boolValues) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.ebool,
          });
          inputCts.push(ct);
        }

        const createTxHash = await elistTest.write.newBoolList([inputCts, walletClient.account.address], {
          value: parseEther('0.0002'),
        });
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        const ctValue = await zap.encrypt(false, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.ebool,
        });

        const txHash = await elistTest.write.boolListInsert([1, ctValue], { value: parseEther('0.0001') });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        // Verify the inserted element
        const getSim = await elistTest.simulate.boolListGet([1]);
        const getTxHash = await elistTest.write.boolListGet([1]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(false);
      }, 90_000);

      it('should insert bool element at encrypted index', async () => {
        const boolValues = [true, true];
        const inputCts = [];
        for (const value of boolValues) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.ebool,
          });
          inputCts.push(ct);
        }

        const createTxHash = await elistTest.write.newBoolList([inputCts, walletClient.account.address], {
          value: parseEther('0.0002'),
        });
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        const ctIndex = await zap.encrypt(1, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });

        const ctValue = await zap.encrypt(false, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.ebool,
        });

        const txHash = await elistTest.write.boolListInsertEncryptedIndex([ctIndex, ctValue], {
          value: parseEther('0.0002'),
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        // Verify the inserted element
        const getSim = await elistTest.simulate.boolListGet([1]);
        const getTxHash = await elistTest.write.boolListGet([1]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(false);
      }, 90_000);

      it('should slice bool list with length', async () => {
        const boolValues = [true, false, true, false, true];
        const inputCts = [];
        for (const value of boolValues) {
          const ct = await zap.encrypt(value, {
            accountAddress: walletClient.account.address,
            dappAddress: elistTestAddress,
            handleType: handleTypes.ebool,
          });
          inputCts.push(ct);
        }

        const createTxHash = await elistTest.write.newBoolList([inputCts, walletClient.account.address], {
          value: parseEther('0.0005'),
        });
        await publicClient.waitForTransactionReceipt({ hash: createTxHash });

        const ctStart = await zap.encrypt(1, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.euint256,
        });

        const ctDefault = await zap.encrypt(false, {
          accountAddress: walletClient.account.address,
          dappAddress: elistTestAddress,
          handleType: handleTypes.ebool,
        });

        const txHash = await elistTest.write.boolListSliceLen([ctStart, 3, ctDefault], {
          value: parseEther('0.0002'),
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        // Verify first element of slice (should be false)
        const getSim = await elistTest.simulate.boolListGet([0]);
        const getTxHash = await elistTest.write.boolListGet([0]);
        await publicClient.waitForTransactionReceipt({ hash: getTxHash });

        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [getSim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(false);
      }, 120_000);
    });
  });
}
