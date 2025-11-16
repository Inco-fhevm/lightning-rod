import { type Chain, type Hex, createPublicClient, createWalletClient, http, parseEther } from 'viem';
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

