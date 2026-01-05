import { incoLightningAbi } from '@inco/js/abis/lightning';
import { incoVerifierAbi } from '@inco/js/abis/verifier';
import { Lightning } from '@inco/js/lite';
import { handleTypes } from '@inco/js';
import { Chain, createPublicClient, createWalletClient, defineChain, getContract, Hex, http, parseGwei } from 'viem';
import { Address, privateKeyToAccount } from 'viem/accounts';
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
  addTwoAddress: Address,
) => {
  let privateKeyHex: Hex;
  if (chain === anvil) {
    const zap = await Lightning.localNode('testnet');
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
  const ciphertext = await lightning.encrypt(
    value,
    {
      accountAddress: walletClient.account.address,
      dappAddress: addTwoAddress,
      handleType: handleTypes.euint256,
    },
  );
  return ciphertext;
};

export const decrypt = async (
  lightning: Lightning,
  privateKey: Hex,
  chain: Chain,
  hostChainRpcUrl: string,
  handle: Hex,
) => {
  const account = privateKeyToAccount(privateKey);
  const viemChain = defineChain({
    ...chain,
    fees: { maxPriorityFeePerGas: parseGwei('10') },
  });
  const walletClient = createWalletClient({
    chain: viemChain,
    transport: http(hostChainRpcUrl),
    account,
  });

  // Initial delay to allow covalidator to process the transaction
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Retry logic with exponential backoff for KMS service
  const maxRetries = 10;
  const baseDelayInMs = 1000;
  const backoffFactor = 1.5;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const decrypted = await lightning.attestedDecrypt(walletClient, [handle]);
      if (attempt > 1) {
        console.log(`Decrypt succeeded on attempt ${attempt}`);
      }
      return decrypted[0]?.plaintext?.value;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorString = String(err);
      // Check for HTTP status codes or error messages indicating server errors
      const statusCode = (err as any)?.status || (err as any)?.statusCode || (err as any)?.code;
      // More comprehensive error detection - check error message, string representation, and status codes
      const isRetryableError =
        statusCode === 500 ||
        statusCode === 503 ||
        statusCode === '500' ||
        statusCode === '503' ||
        errorMessage.includes('500') ||
        errorMessage.includes('503') ||
        errorMessage.includes('Internal Server Error') ||
        errorMessage.includes('Service Unavailable') ||
        errorMessage.includes('AttestedDecrypt') ||
        errorString.includes('500') ||
        errorString.includes('503') ||
        errorString.includes('Internal Server Error') ||
        errorString.includes('Service Unavailable');

      if (attempt === maxRetries || !isRetryableError) {
        console.error(`Error decrypting result handle after ${attempt} attempts:`, err);
        console.error(`Error details - message: ${errorMessage}, string: ${errorString}, statusCode: ${statusCode}`);
        throw err;
      }

      const delay = baseDelayInMs * Math.pow(backoffFactor, attempt - 1);
      console.log(
        `Decrypt attempt ${attempt} failed, retrying in ${Math.round(delay)}ms... (Error: ${errorMessage.substring(0, 100)})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Failed to decrypt after all retries');
};
