import { HexString, parseAddress } from '@inco/js';
import { incoLightningAbi } from '@inco/js/abis';
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
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeAll, describe, expect, it } from 'vitest';
import addTwoBuild from '../../../contracts/out/AddTwo.sol/AddTwo.json';
import { addTwoAbi } from '../generated/abis';

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
    let requestId: bigint;
    let callbackFulfillPromise: Promise<void>;
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

      // Step 1.
      const inputCt = await zap.encrypt(valueToAdd, {
        accountAddress: walletClient.account.address,
        dappAddress,
      });

      // Already start watching for the fullfilled event. This is because on
      // Monad, stuff is happening so fast that it's better to start watching
      // for events as soon as possible.
      const incoLite = getContract({
        abi: incoLightningAbi,
        address: zap.executorAddress,
        client: publicClient,
      });
      if (!incoLite) {
        throw new Error(`IncoLite contract not found at address ${zap.executorAddress}`);
      }
      callbackFulfillPromise = new Promise((resolve) => {
        incoLite.watchEvent.RequestFulfilled({ requestId }, { onLogs: () => resolve() });
      });

      // Step 2.
      const res = await addTwo(dappAddress, inputCt, walletClient, publicClient, cfg);
      resultHandle = res.resultHandle;
      requestId = res.requestId;
    },100_000);//Include 100s timeout for sepolia backend testing

    it('should read from the decrypted message', async () => {
      console.log();
      console.log(`Waiting for RequestFulfilled event with requestId ${requestId}...`);
      await callbackFulfillPromise;
      console.log('RequestFulfilled event received');

      const dapp = getContract({
        abi: addTwoAbi,
        address: dappAddress,
        client: publicClient,
      });

      const lastResult = await dapp.read.lastResult();
      expect(lastResult).toBe(BigInt(valueToAdd + 2));
    }, 20_000);

    it('should reencrypt a message', async () => {
      // Step 3.
      console.warn('###############################################');
      console.warn(`# Step 3. Reencrypt the result handle`);
      console.warn('###############################################');
      console.warn(`# Using covalidator ${zap.covalidatorUrl}`);
      const reencryptor = await zap.getReencryptor(walletClient);
      const decrypted = await reencryptor({ handle: resultHandle });
      expect(decrypted.value).toBe(BigInt(valueToAdd + 2));
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
): Promise<{ requestId: bigint; resultHandle: HexString }> {
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

  console.log();
  console.log(`Simulating the call to add 2 to ${prettifyInputCt(inputCt)}`);
  const {
    result: [requestId, resultHandle],
  } = await dapp.simulate.addTwoEOA([inputCt]);
  console.log(`Result handle: ${resultHandle}`);

  console.log();
  console.log(`Calling the dapp contract to add 2 to ${prettifyInputCt(inputCt)}`);
  // With some testing, we found that 300000 gas is enough for this tx.
  // ref: https://testnet.monadexplorer.com/tx/0x562e301221c942c50c758076d67bef85c41cd51def9d8f4ad2d514aa8ab5f74d
  // ref: https://sepolia.basescan.org/tx/0x9141788e279a80571b0b5fcf203a7dc6599b6a3ad14fd3353e51089dc3c870a6
  const txHash = await dapp.write.addTwoEOA([inputCt], { gas: BigInt(300000) });
  console.log(`Tx submitted: ${chain.blockExplorers?.default.url ?? 'no-explorer'}/tx/${txHash}`);

  console.log();
  console.log('Waiting for tx to be included in a block...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log(`Transaction included in block ${receipt.blockNumber}`);

  return { requestId, resultHandle };
}

// Deploys the AddTwo.sol contract on the host chain.
async function deployAddTwo(cfg: E2EConfig): Promise<Address> {
  console.log();
  console.log(`Deploying AddTwo.sol contract ...`);
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
