import { useState } from 'react'
import type { Chain, Hex } from 'viem'
import { createIncoLite, encrypt } from './lib/inco.ts'

type IncoTestProps = {
  chain: Chain
  pepper: unknown
  privateKey: Hex
  hostChainRpcUrl: string
  value: bigint | boolean
}

export default function IncoTest({
  chain,
  pepper,
  privateKey,
  hostChainRpcUrl,
  value,
}: IncoTestProps) {
  const [ciphertext, setCiphertext] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)

  const handleCiphertextCreate = async () => {
    setIsEncrypting(true)
    try {
      const incoLite = await createIncoLite(chain, pepper)
      const encryptedValue = await encrypt(
        incoLite,
        privateKey,
        chain,
        hostChainRpcUrl,
        value,
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
      {error && (
        <p role="alert">
          <strong>Error:</strong> {error}
        </p>
      )}
    </div>
  )
}