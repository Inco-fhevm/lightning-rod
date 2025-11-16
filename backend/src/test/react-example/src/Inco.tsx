import { useCallback, useEffect, useState } from 'react'
import type { Address, Chain, Hex } from 'viem'
import { createIncoLite, encrypt, decrypt } from './lib/inco.ts'
import { privateKeyToAccount } from 'viem/accounts'
import { addTwoAbi } from './abis.ts'
import { createPublicClient, defineChain, getContract, parseEther } from 'viem'
import { parseGwei } from 'viem'
import { createWalletClient, http } from 'viem'
import { Lightning } from '@inco/js/lite'


type IncoTestProps = {
  chain: Chain
  pepper: unknown
  privateKey: Hex
  hostChainRpcUrl: string
  value: bigint | boolean
  addTwoAddress: Address
}

export default function IncoTest({
  chain,
  pepper,
  privateKey,
  hostChainRpcUrl,
  value,
  addTwoAddress,
}: IncoTestProps) {
  const [ciphertext, setCiphertext] = useState<string | null>(null)
  const [incoLite, setIncoLite] = useState<Lightning | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [resultHandle, setResultHandle] = useState<Hex | null>(null)
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null)
  const handleCiphertextCreate = async () => {
    setIsEncrypting(true)
    try {
      // const zap = await Lightning.localNode('alphanet');
      const incoLite = await createIncoLite(chain, pepper)
      setIncoLite(incoLite)
      const encryptedValue = await encrypt(
        incoLite,
        privateKey,
        chain,
        hostChainRpcUrl,
        value,
        addTwoAddress,
      )
      setCiphertext(encryptedValue)
      setError(null)
    } catch (err) {
      setCiphertext(null)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsEncrypting(false)
    }
  }
  
  const handleCiphertextSubmit = useCallback(async (ciphertext: Hex) => {
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
    const publicClient = createPublicClient({
      chain: viemChain,
      transport: http(hostChainRpcUrl),
    });
    const dapp = getContract({
      abi: addTwoAbi,
      address: addTwoAddress,
      client: walletClient,
    });
    let simResultHandle: Hex;
    try {
      const { result: resultHandle } = await dapp.simulate.addTwoEOA([ciphertext], { value: parseEther('0.01') });
      if (!resultHandle) {
        throw new Error('Failed to get result from simulation');
      }
      simResultHandle = resultHandle as Hex;
      console.log(`Result handle: ${simResultHandle}`);
      setResultHandle(simResultHandle);
    } catch (err) {
      console.error(`Error simulating the call to add 2 to ${ciphertext}: ${err}`);
      throw err;
    }

    try {
      const txHash = await dapp.write.addTwoEOA([ciphertext], { value: parseEther('0.01') });
      console.log(`Transaction hash: ${txHash}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`Transaction included in block ${receipt.blockNumber}`);
      // Ensure result handle is set after transaction confirmation
      setResultHandle(simResultHandle);
    } catch (err) {
      console.error(`Error writing the call to add 2 to ${ciphertext}: ${err}`);
      throw err;
    }
  }, [privateKey, chain, hostChainRpcUrl, addTwoAddress]);

  const decryptResult = useCallback(async () => {
    if (!incoLite || !resultHandle) {
      console.error('Cannot decrypt: incoLite or resultHandle is missing');
      setError('Cannot decrypt: missing incoLite or resultHandle');
      return;
    }
    console.log(`Starting decryption for handle: ${resultHandle}`);
    try {
      const decrypted = await decrypt(incoLite, privateKey, chain, hostChainRpcUrl, resultHandle)
      console.log(`Decryption successful: ${decrypted}`);
      setDecryptedResult(decrypted?.toString() ?? null)
      setError(null)
    } catch (err) {
      console.error('Decryption error:', err);
      setDecryptedResult(null)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [incoLite, privateKey, chain, hostChainRpcUrl, resultHandle]);
  
  useEffect(() => {
    if (ciphertext) {
      handleCiphertextSubmit(ciphertext as Hex).catch((err) => {
        console.error('Error in handleCiphertextSubmit:', err);
        setError(err instanceof Error ? err.message : String(err));
      });
    }
  }, [ciphertext, handleCiphertextSubmit]);
  return (
    <div>
      <h1>Inco Test</h1>
      <p>
        <strong>Value:</strong> {value.toString()}
      </p>
      <button onClick={handleCiphertextCreate} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting…' : 'Encrypt value'}
      </button>
      {ciphertext && (
        <p data-testid="ciphertext">
          <strong>Ciphertext:</strong> {ciphertext}
        </p>
      )}
      {resultHandle && (
        <>
        <p data-testid="result-handle">
          <strong>Result handle:</strong> {resultHandle}
        </p>
        <button onClick={decryptResult} disabled={!resultHandle}>
          {!resultHandle ? 'Result handle not found' : 'Decrypt result'}
        </button>
        {decryptedResult && (
          <p data-testid="decrypted-result">
            <strong>Decrypted result:</strong> {decryptedResult}
          </p>
        )}
        </>
      )}
      {error && (
        <p role="alert">
          <strong>Error:</strong> {error}
        </p>
      )}
    </div>
  )
}