import { HexString, parseAddress } from '@inco/js';
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
import { addTwoAbi } from '../generated/abis.js';
import { type E2EConfig, type E2EParams } from './lightning-test.js';
import { handleTypes } from '@inco/js';

export function runAddTwoE2ETest(zap: Lightning, cfg: E2EConfig,params: E2EParams) {
  const { walletClient, publicClient, incoLite } = params;
  const valueToAdd = Math.floor(Math.random() * 100);

  describe('Lightning AddTwo E2E', () => {
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
      const incoVerifierAddress = await incoLite.read.incoVerifier();
      const incoVerifier = getContract({
        abi: incoVerifierAbi,
        address: incoVerifierAddress,
        client: publicClient,
      });

      const inputCt = await zap.encrypt(
        valueToAdd,
        {
          accountAddress: walletClient.account.address,
          dappAddress,
          handleType: handleTypes.euint256,
        },
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

export async function fundAccount(senderPrivKey: Hex, chain: Chain, hostChainRpcUrl: string) {
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
