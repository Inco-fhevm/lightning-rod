import { useCallback, useEffect, useState } from 'react'
import type { Address, Chain, Hex } from 'viem'
import { createIncoLite, encrypt } from './lib/inco.ts'
import { privateKeyToAccount } from 'viem/accounts'
import { creditScoreGateAbi } from './abis.ts'
import { createPublicClient, defineChain, getContract, parseEther, toHex } from 'viem'
import { parseGwei } from 'viem'
import { createWalletClient, http } from 'viem'
import { Lightning, AttestedComputeSupportedOps } from '@inco/js/lite'
import type { HexString } from '@inco/js'

type CreditScoreGateProps = {
  chain: Chain
  pepper: unknown
  privateKey: Hex
  hostChainRpcUrl: string
  creditScore: bigint
  gateAddress: Address
}

export default function CreditScoreGateTest({
  chain,
  pepper,
  privateKey,
  hostChainRpcUrl,
  creditScore,
  gateAddress,
}: CreditScoreGateProps) {
  const [ciphertext, setCiphertext] = useState<string | null>(null)
  const [incoLite, setIncoLite] = useState<Lightning | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [scoreHandle, setScoreHandle] = useState<Hex | null>(null)
  const [computeResult, setComputeResult] = useState<boolean | null>(null)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)

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
        creditScore,
        gateAddress,
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

  const handleSubmitScore = useCallback(async (ciphertext: Hex) => {
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
    const gate = getContract({
      abi: creditScoreGateAbi,
      address: gateAddress,
      client: walletClient,
    })

    try {
      const txHash = await gate.write.setCreditScore([ciphertext], {
        value: parseEther('0.01'),
      })
      console.log(`setCreditScore tx: ${txHash}`)
      await publicClient.waitForTransactionReceipt({ hash: txHash })

      const gateRead = getContract({
        abi: creditScoreGateAbi,
        address: gateAddress,
        client: publicClient,
      })
      const handle = await gateRead.read.getHandle([account.address]) as Hex
      console.log(`Score handle: ${handle}`)
      setScoreHandle(handle)
    } catch (err) {
      console.error('Error submitting score:', err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [privateKey, chain, hostChainRpcUrl, gateAddress])

  const handleAttestedCompute = useCallback(async () => {
    if (!incoLite || !scoreHandle) {
      setError('Cannot compute: missing incoLite or scoreHandle')
      return
    }

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

    try {
      // Read threshold from contract
      const gateRead = getContract({
        abi: creditScoreGateAbi,
        address: gateAddress,
        client: publicClient,
      })
      const threshold = await gateRead.read.threshold()

      // Attested compute: score >= threshold
      const result = await incoLite.attestedCompute(
        walletClient,
        scoreHandle as HexString,
        AttestedComputeSupportedOps.Ge,
        threshold as bigint,
      )
      console.log(`Attested compute result: ${result.plaintext.value}`)
      setComputeResult(result.plaintext.value as boolean)

      // Submit attestation on-chain
      const gate = getContract({
        abi: creditScoreGateAbi,
        address: gateAddress,
        client: walletClient,
      })
      const decryption = {
        handle: result.handle as Hex,
        value: toHex(result.plaintext.value ? BigInt(1) : BigInt(0), { size: 32 }),
      }
      const signatures = result.covalidatorSignatures.map((s) => toHex(s))
      const txHash = await gate.write.submitCreditCheck(
        [decryption, signatures],
      )
      await publicClient.waitForTransactionReceipt({ hash: txHash })

      // Read approval status
      const approved = await gateRead.read.isApproved([account.address])
      setIsApproved(approved as boolean)
      setError(null)
    } catch (err) {
      console.error('Error in attested compute:', err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [incoLite, scoreHandle, privateKey, chain, hostChainRpcUrl, gateAddress])

  useEffect(() => {
    if (ciphertext) {
      handleSubmitScore(ciphertext as Hex).catch((err) => {
        console.error('Error in handleSubmitScore:', err)
        setError(err instanceof Error ? err.message : String(err))
      })
    }
  }, [ciphertext, handleSubmitScore])

  return (
    <div>
      <h1>Credit Score Gate Test</h1>
      <p>
        <strong>Credit Score:</strong> {creditScore.toString()}
      </p>

      <button onClick={handleEncrypt} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting…' : 'Encrypt Score'}
      </button>

      {ciphertext && (
        <p data-testid="ciphertext">
          <strong>Ciphertext:</strong> {ciphertext}
        </p>
      )}

      {scoreHandle && (
        <>
          <p data-testid="score-handle">
            <strong>Score Handle:</strong> {scoreHandle}
          </p>
          <button onClick={handleAttestedCompute} disabled={!scoreHandle}>
            Check Credit Score
          </button>
        </>
      )}

      {computeResult !== null && (
        <p data-testid="compute-result">
          <strong>Score Meets Threshold:</strong> {computeResult ? 'Yes' : 'No'}
        </p>
      )}

      {isApproved !== null && (
        <p data-testid="is-approved">
          <strong>Approved:</strong> {isApproved ? 'Yes' : 'No'}
        </p>
      )}

      {error && (
        <p role="alert">
          <strong>Error:</strong> {error}
        </p>
      )}
    </div>
  )
}
