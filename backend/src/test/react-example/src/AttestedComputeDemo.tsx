import { useCallback, useEffect, useState } from 'react'
import type { Address, Chain, Hex } from 'viem'
import { createIncoLite, encrypt } from './lib/inco.ts'
import { privateKeyToAccount } from 'viem/accounts'
import { attestedComputeDemoAbi } from './abis.ts'
import { createPublicClient, defineChain, getContract, parseEther, parseGwei, toHex } from 'viem'
import { createWalletClient, http } from 'viem'
import { Lightning, AttestedComputeSupportedOps } from '@inco/js/lite'
import type { HexString } from '@inco/js'

const OP_NAMES = ['Eq', 'Ne', 'Ge', 'Gt', 'Le', 'Lt'] as const
const SDK_OPS: Record<string, (typeof AttestedComputeSupportedOps)[keyof typeof AttestedComputeSupportedOps]> = {
  Eq: AttestedComputeSupportedOps.Eq,
  Ne: AttestedComputeSupportedOps.Ne,
  Ge: AttestedComputeSupportedOps.Ge,
  Gt: AttestedComputeSupportedOps.Gt,
  Le: AttestedComputeSupportedOps.Le,
  Lt: AttestedComputeSupportedOps.Lt,
}

type AttestedComputeDemoProps = {
  chain: Chain
  pepper: unknown
  privateKey: Hex
  hostChainRpcUrl: string
  value: bigint
  scalar: bigint
  demoAddress: Address
}

export default function AttestedComputeDemoTest({
  chain,
  pepper,
  privateKey,
  hostChainRpcUrl,
  value,
  scalar,
  demoAddress,
}: AttestedComputeDemoProps) {
  const [ciphertext, setCiphertext] = useState<string | null>(null)
  const [incoLite, setIncoLite] = useState<Lightning | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [handle, setHandle] = useState<Hex | null>(null)
  const [results, setResults] = useState<Record<string, boolean | null>>({})

  const handleEncrypt = async () => {
    setIsEncrypting(true)
    try {
      const incoLite = await createIncoLite(chain, pepper)
      setIncoLite(incoLite)
      const encryptedValue = await encrypt(
        incoLite,
        privateKey,
        chain,
        hostChainRpcUrl,
        value,
        demoAddress,
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

  const handleSubmitValue = useCallback(async (ciphertext: Hex) => {
    const account = privateKeyToAccount(privateKey)
    const viemChain = defineChain({
      ...chain,
      fees: { maxPriorityFeePerGas: parseGwei('10') },
    })
    const walletClient = createWalletClient({
      chain: viemChain,
      transport: http(hostChainRpcUrl),
      account,
    })
    const publicClient = createPublicClient({
      chain: viemChain,
      transport: http(hostChainRpcUrl),
    })
    const demo = getContract({
      abi: attestedComputeDemoAbi,
      address: demoAddress,
      client: walletClient,
    })

    try {
      const txHash = await demo.write.setEncryptedValue([ciphertext], {
        value: parseEther('0.01'),
      })
      await publicClient.waitForTransactionReceipt({ hash: txHash })

      const demoRead = getContract({
        abi: attestedComputeDemoAbi,
        address: demoAddress,
        client: publicClient,
      })
      const h = await demoRead.read.getHandle([account.address]) as Hex
      setHandle(h)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [privateKey, chain, hostChainRpcUrl, demoAddress])

  const runAllOps = useCallback(async () => {
    if (!incoLite || !handle) return

    const account = privateKeyToAccount(privateKey)
    const viemChain = defineChain({
      ...chain,
      fees: { maxPriorityFeePerGas: parseGwei('10') },
    })
    const walletClient = createWalletClient({
      chain: viemChain,
      transport: http(hostChainRpcUrl),
      account,
    })
    const publicClient = createPublicClient({
      chain: viemChain,
      transport: http(hostChainRpcUrl),
    })

    const newResults: Record<string, boolean | null> = {}

    for (let i = 0; i < OP_NAMES.length; i++) {
      const opName: string = OP_NAMES[i]!
      try {
        const computeResult = await incoLite.attestedCompute(
          walletClient,
          handle as HexString,
          SDK_OPS[opName]!,
          scalar,
        )
        newResults[opName] = computeResult.plaintext.value as boolean

        // Submit attestation on-chain
        const demo = getContract({
          abi: attestedComputeDemoAbi,
          address: demoAddress,
          client: walletClient,
        })
        const decryption = {
          handle: computeResult.handle as Hex,
          value: toHex(computeResult.plaintext.value ? BigInt(1) : BigInt(0), { size: 32 }),
        }
        const signatures = computeResult.covalidatorSignatures.map((s) => toHex(s))
        const txHash = await demo.write.submitAttestation(
          [i, scalar, decryption, signatures],
        )
        await publicClient.waitForTransactionReceipt({ hash: txHash })
      } catch (err) {
        console.error(`Error in ${opName}:`, err)
        newResults[opName] = null
      }
    }
    setResults(newResults)
  }, [incoLite, handle, privateKey, chain, hostChainRpcUrl, scalar, demoAddress])

  useEffect(() => {
    if (ciphertext) {
      handleSubmitValue(ciphertext as Hex).catch((err) => {
        setError(err instanceof Error ? err.message : String(err))
      })
    }
  }, [ciphertext, handleSubmitValue])

  return (
    <div>
      <h1>Attested Compute Demo</h1>
      <p><strong>Value:</strong> {value.toString()}</p>
      <p><strong>Scalar:</strong> {scalar.toString()}</p>

      <button onClick={handleEncrypt} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting…' : 'Encrypt Value'}
      </button>

      {ciphertext && (
        <p data-testid="ciphertext">
          <strong>Ciphertext:</strong> {ciphertext}
        </p>
      )}

      {handle && (
        <>
          <p data-testid="handle">
            <strong>Handle:</strong> {handle}
          </p>
          <button onClick={runAllOps}>Run All Operations</button>
        </>
      )}

      {Object.keys(results).length > 0 && (
        <div data-testid="results">
          <h2>Results</h2>
          {OP_NAMES.map((op) => (
            <p key={op} data-testid={`result-${op}`}>
              <strong>{op}:</strong> {results[op] !== null && results[op] !== undefined ? (results[op] ? 'true' : 'false') : 'error'}
            </p>
          ))}
        </div>
      )}

      {error && (
        <p role="alert">
          <strong>Error:</strong> {error}
        </p>
      )}
    </div>
  )
}
