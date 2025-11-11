import { incoLightningAbi } from '@inco/js/abis/lightning';
import { Transport, PublicClient, Address, type Chain, type Hex, Account, WalletClient, GetContractReturnType, getContract, http, parseGwei, createWalletClient, createPublicClient, defineChain } from 'viem';
import { runAddTwoE2ETest } from './lightning-addtwo.js';
import { runLibTestE2ETest } from './lightning-libtest.js';
import { Lightning } from '@inco/js/lite';
import { privateKeyToAccount } from 'viem/accounts';

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
export interface E2EParams {
  walletClient: WalletClient<Transport, Chain, Account>;
  publicClient: PublicClient<Transport, Chain>;
  incoLite: GetContractReturnType<
    typeof incoLightningAbi,
    PublicClient<Transport, Chain>,
    Address
  >;
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

export function runE2ETest(zap: Lightning, cfg: E2EConfig,) {
  const account = privateKeyToAccount(cfg.senderPrivKey);
  const viemChain = defineChain({
    ...cfg.chain,
    fees: { maxPriorityFeePerGas: parseGwei('10') },
  });
  const walletClient = createWalletClient({
    chain: viemChain,
    transport: http(cfg.hostChainRpcUrl),
    account,
  });
  const publicClient = createPublicClient({
    chain: viemChain,
    transport: http(cfg.hostChainRpcUrl),
  }) as PublicClient<Transport, Chain>;

  const incoLite = getContract({
    abi: incoLightningAbi,
    address: zap.executorAddress,
    client: publicClient,
  });

  const params: E2EParams = { walletClient, publicClient, incoLite };
  runAddTwoE2ETest(zap, cfg, params);
  runLibTestE2ETest(zap, cfg, params);
}
