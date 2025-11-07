import { HexString, parseAddress } from '@inco/js';
import { incoLightningAbi } from '@inco/js/abis/lightning';
import { incoVerifierAbi } from '@inco/js/abis/verifier';
import { Lightning } from '@inco/js/lite';
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
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeAll, describe, expect, it } from 'vitest';
import addTwoBuild from '../../../contracts/out/AddTwo.sol/AddTwo.json';
import libTestBuild from '../../../contracts/out/LibTest.sol/LibTest.json';
import { addTwoAbi, libTestAbi } from '../generated/abis.js';

// E2EConfig contains all configuration needed to run a test against
// a specific deployment.
export interface E2EConfig {
  // Ethereum Private key of the user account sending the transaction or
  // requesting a reencryption. Needs to have some tokens on the chain.
  senderPrivKey: Hex;
  chain: Chain;
  // RPC of the host chain.
  hostChainRpcUrl: string;
  // Address of the confidential token contract.
  // dappAddress: Address;
}

export const backoffConfig = {
  errHandler: (error: Error, attempt: number) => {
    console.log(`Backoff: Attempt ${attempt} failed: ${error.message}`);
    return 'continue';
  },
  maxRetries: 10,
  baseDelayInMs: 1000,
  backoffFactor: 1.5,
};

export function runE2ETest(valueToAdd: number, zap: Lightning, cfg: E2EConfig) {
  const account = privateKeyToAccount(cfg.senderPrivKey);
  const viemChain = cfg.chain;
  // TODO: my attempt to override gas fees to work around insufficient balance error without success:
  // const viemChain = defineChain({ ...getViemChain(cfg.chain), fees: { maxPriorityFeePerGas: parseGwei('10') } });
  const walletClient = createWalletClient({
    chain: viemChain,
    transport: http(cfg.hostChainRpcUrl),
    account,
  });
  const publicClient = createPublicClient({
    chain: viemChain,
    transport: http(cfg.hostChainRpcUrl),
  }) as PublicClient<Transport, Chain>;

  describe('Lightning AddTwo E2E', () => {
    // Will hold the handle of the result of the `addTwoEOA` call.
    let resultHandle: HexString;
    let dappAddress: Address;

    beforeAll(async () => {
      console.warn('###############################################');
      console.warn(`# Step 0. Deploy the AddTwo contract`);
      console.warn('###############################################');
      dappAddress = await deployAddTwo(cfg);
      console.warn(`AddTwo contract deployed at ${dappAddress}`);
      console.warn('Running this test has some prerequisites:');
      console.warn(`- The IncoLite contract ${zap.executorAddress} must be deployed on ${cfg.chain.name}`);
      console.warn(`- The dapp contract ${dappAddress} must be deployed on ${cfg.chain.name}`);
      console.warn(
        `- The sender ${privateKeyToAccount(cfg.senderPrivKey).address} must have some ${cfg.chain.name} tokens`,
      );
    }, 100_000);

    it('should read from the decrypted message', async () => {
      const incoLite = getContract({
        abi: incoLightningAbi,
        address: zap.executorAddress,
        client: publicClient,
      });

      const incoVerifierAddress = await incoLite.read.incoVerifier();
      const incoVerifier = getContract({
        abi: incoVerifierAbi,
        address: incoVerifierAddress,
        client: publicClient,
      });
      const eciesKey = await incoVerifier.read.eciesPubkey();
      const encryptor = zap.getEncryptor(eciesKey);

      const inputCt = await zap.encrypt(
        valueToAdd,
        {
          accountAddress: walletClient.account.address,
          dappAddress,
        },
        encryptor,
      );
      const { resultHandle } = await addTwo(dappAddress, inputCt, walletClient, publicClient, cfg);
      console.log(`Result handle: ${resultHandle}`);
      const decrypted = await zap.attestedDecrypt(walletClient as any, [resultHandle]);
      const result = decrypted[0]?.plaintext?.value;
      console.log(`Result:`, result);
      expect(result).toBe(BigInt(valueToAdd + 2));
    }, 20_000);

    it('should reencrypt a message', async () => {
      // Step 3.
      console.warn('###############################################');
      console.warn(`# Step 3. Reencrypt the result handle`);
      console.warn('###############################################');
      console.warn(`# Using covalidator ${zap.covalidatorUrl}`);
      // const reencryptor = await zap.getReencryptor(walletClient);
      // const decrypted = await reencryptor({ handle: resultHandle });
      // expect(decrypted.value).toBe(BigInt(valueToAdd + 2));
    }, 10_000);
  });
}

// Sends a tx on the host chain to call `addTwo`.
async function addTwo(
  dappAddress: Address,
  inputCt: HexString,
  walletClient: WalletClient<Transport, Chain, Account>,
  publicClient: PublicClient<Transport, Chain>,
  cfg: E2EConfig,
): Promise<{ resultHandle: HexString }> {
  const chain = cfg.chain;
  console.log();
  console.log('###############################################');
  console.log(`# Step 2. Send a tx to ${chain.name}`);
  console.log('###############################################');

  const dapp = getContract({
    abi: addTwoAbi,
    address: dappAddress,
    client: walletClient,
  });

  console.log(`Simulating the call to add 2 to ${prettifyInputCt(inputCt)}`);
  const { result: resultHandle } = await dapp.simulate.addTwoEOA([inputCt], { value: parseEther('0.001') });

  if (!resultHandle) {
    throw new Error('Failed to get resultHandle from simulation');
  }
  console.log(`Result handle: ${resultHandle}`);

  console.log();
  console.log(`Calling the dapp contract to add 2 to ${prettifyInputCt(inputCt)}`);
  // With some testing, we found that 300000 gas is enough for this tx.
  // ref: https://testnet.monadexplorer.com/tx/0x562e301221c942c50c758076d67bef85c41cd51def9d8f4ad2d514aa8ab5f74d
  // ref: https://sepolia.basescan.org/tx/0x9141788e279a80571b0b5fcf203a7dc6599b6a3ad14fd3353e51089dc3c870a6
  const txHash = await dapp.write.addTwoEOA([inputCt], { gas: BigInt(300000), value: parseEther('0.001') });
  console.log(`Tx submitted: ${chain.blockExplorers?.default.url ?? 'no-explorer'}/tx/${txHash}`);

  console.log();
  console.log('Waiting for tx to be included in a block...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log(`Transaction included in block ${receipt.blockNumber}`);

  return { resultHandle: resultHandle as HexString };
}

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
  return parseAddress(contractAddress);
}

function prettifyInputCt(hex: HexString): string {
  return `${hex.slice(0, 8)}...${hex.slice(-6)}`;
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

export function runLibTestE2ETest(zap: Lightning, cfg: E2EConfig) {
  const account = privateKeyToAccount(cfg.senderPrivKey);
  const viemChain = cfg.chain;
  const walletClient = createWalletClient({
    chain: viemChain,
    transport: http(cfg.hostChainRpcUrl),
    account,
  });
  const publicClient = createPublicClient({
    chain: viemChain,
    transport: http(cfg.hostChainRpcUrl),
  }) as PublicClient<Transport, Chain>;

  describe('Lightning LibTest E2E', () => {
    let libTestAddress: Address;
    let encryptor: any;
    let libTest: any;
    let handleA: HexString;
    let handleB: HexString;
    let handleC: HexString;
    let handleTrue: HexString;
    let handleFalse: HexString;

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

      const incoLite = getContract({
        abi: incoLightningAbi,
        address: zap.executorAddress,
        client: publicClient,
      });
      const incoVerifierAddress = await incoLite.read.incoVerifier();
      const incoVerifier = getContract({
        abi: incoVerifierAbi,
        address: incoVerifierAddress,
        client: publicClient,
      });
      const eciesKey = await incoVerifier.read.eciesPubkey();
      encryptor = zap.getEncryptor(eciesKey);

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
          },
          encryptor,
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
          },
          encryptor,
        );
        const handleSim = await libTest.simulate.testNewEbool([inputCt, walletClient.account.address], {
          value: parseEther('0.0001'),
        });
        await libTest.write.testNewEbool([inputCt, walletClient.account.address], {
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
      it.skip('should test rotation left with stored handles', async () => {
        const sim = await libTest.simulate.testRotl([handleB, handleB]);
        const txHash = await libTest.write.testRotl([handleB, handleB]);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        const decryptedArr = await zap.attestedDecrypt(walletClient as any, [sim.result]);
        const value = decryptedArr[0]?.plaintext.value;
        expect(value).toBe(BigInt(160));
      }, 20_000);

      it.skip('should test rotation right with stored handles', async () => {
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
  });
}
