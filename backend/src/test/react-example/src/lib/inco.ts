import { incoLightningAbi } from '@inco/js/abis/lightning';
import { incoVerifierAbi } from '@inco/js/abis/verifier';
import { Lightning } from '@inco/js/lite';
import { Chain, createPublicClient, createWalletClient, defineChain, getContract, Hex, http, parseGwei } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { anvil } from 'viem/chains';
export const createIncoLite = async (chain: Chain, pepper: any) => {
  if (chain === anvil) {
    return await Lightning.localNode(pepper);
  }
  return await Lightning.latest(pepper, chain.id as any);
};
export const encrypt = async (
  lightning: Lightning,
  privateKey: Hex,
  chain: Chain,
  hostChainRpcUrl: string,
  value: bigint | boolean,
) => {
  console.log(`Private key: ${privateKey}`);
  let privateKeyHex: Hex;
  if (chain === anvil) {
    const zap = await Lightning.localNode('alphanet');
    privateKeyHex = zap.deployment.senderPrivateKey as Hex;
  } else {
    privateKeyHex = privateKey;
  }
  const account = privateKeyToAccount(privateKeyHex);
  const viemChain = defineChain({
    ...chain,
    fees: { maxPriorityFeePerGas: parseGwei('10') },
  });
  const walletClient = createWalletClient({
    chain: viemChain,
    transport: http(hostChainRpcUrl),
    account,
  });
  const publicClient = createPublicClient({
    chain: viemChain,
    transport: http(hostChainRpcUrl),
  });
  const incoLite = getContract({
    abi: incoLightningAbi,
    address: lightning.executorAddress,
    client: publicClient,
  });
  const incoVerifierAddress = await incoLite.read.incoVerifier();
  const incoVerifier = getContract({
    abi: incoVerifierAbi,
    address: incoVerifierAddress,
    client: publicClient,
  });
  const eciesKey = await incoVerifier.read.eciesPubkey();
  console.log(`Ecies key:`, eciesKey);
  // const encryptor = lightning.getEncryptor(eciesKey);
  const ciphertext = await lightning.encrypt(
    value,
    {
      accountAddress: walletClient.account.address,
      dappAddress: incoVerifierAddress,
    }
  );
  console.log(`Ciphertext: ${ciphertext}`);
  return ciphertext;
};
