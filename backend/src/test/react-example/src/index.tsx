import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import IncoTest from './Inco.tsx'
import CreditScoreGateTest from './CreditScoreGate.tsx'
import AttestedComputeDemoTest from './AttestedComputeDemo.tsx'
import { anvil } from 'viem/chains'
import { Lightning } from '@inco/js/lite'
import type { Address, Hex } from 'viem'
import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { addTwoAbi, creditScoreGateAbi, attestedComputeDemoAbi } from './abis.ts'
// @ts-ignore -- JSON artifact from Foundry build
import addTwoBuild from '../../../../../contracts/out/AddTwo.sol/AddTwo.json'
// @ts-ignore
import creditScoreGateBuild from '../../../../../contracts/out/CreditScoreGate.sol/CreditScoreGate.json'
// @ts-ignore
import attestedComputeDemoBuild from '../../../../../contracts/out/AttestedComputeDemo.sol/AttestedComputeDemo.json'

const HOST_CHAIN_RPC = 'http://localhost:8545'
const CREDIT_THRESHOLD = BigInt(700)

async function setup(): Promise<{
  privateKey: Hex
  addTwoAddress: Address
  creditScoreGateAddress: Address
  attestedComputeDemoAddress: Address
}> {
  const zap = await Lightning.localNode('testnet')
  const senderPrivKey = zap.deployment.senderPrivateKey as Hex
  const account = privateKeyToAccount(senderPrivKey)

  const walletClient = createWalletClient({
    chain: anvil,
    transport: http(HOST_CHAIN_RPC),
    account,
  })
  const publicClient = createPublicClient({
    chain: anvil,
    transport: http(HOST_CHAIN_RPC),
  })

  // Fund the sender account
  const richAccount = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
  const richWallet = createWalletClient({
    chain: anvil,
    transport: http(HOST_CHAIN_RPC),
    account: richAccount,
  })
  await richWallet.sendTransaction({ to: account.address, value: parseEther('5') })

  // Deploy AddTwo
  const addTwoHash = await walletClient.deployContract({
    abi: addTwoAbi,
    bytecode: addTwoBuild.bytecode.object as Hex,
  })
  const addTwoReceipt = await publicClient.waitForTransactionReceipt({ hash: addTwoHash })
  if (!addTwoReceipt.contractAddress) throw new Error('AddTwo deploy failed')

  // Deploy CreditScoreGate
  const creditHash = await walletClient.deployContract({
    abi: creditScoreGateAbi,
    bytecode: creditScoreGateBuild.bytecode.object as Hex,
    args: [CREDIT_THRESHOLD],
  })
  const creditReceipt = await publicClient.waitForTransactionReceipt({ hash: creditHash })
  if (!creditReceipt.contractAddress) throw new Error('CreditScoreGate deploy failed')

  // Deploy AttestedComputeDemo
  const attestedHash = await walletClient.deployContract({
    abi: attestedComputeDemoAbi,
    bytecode: attestedComputeDemoBuild.bytecode.object as Hex,
  })
  const attestedReceipt = await publicClient.waitForTransactionReceipt({ hash: attestedHash })
  if (!attestedReceipt.contractAddress) throw new Error('AttestedComputeDemo deploy failed')

  return {
    privateKey: senderPrivKey,
    addTwoAddress: addTwoReceipt.contractAddress,
    creditScoreGateAddress: creditReceipt.contractAddress,
    attestedComputeDemoAddress: attestedReceipt.contractAddress,
  }
}

type Deployed = Awaited<ReturnType<typeof setup>>

function App() {
  const [state, setState] = useState<Deployed | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'addtwo' | 'creditscore' | 'attested'>('addtwo')
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    ;(async () => {
      try {
        setState(await setup())
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })()
  }, [])

  if (error) return <div style={{ color: 'red', padding: 20 }}>Setup error: {error}</div>
  if (!state) return <div style={{ padding: 20 }}>Deploying contracts...</div>

  const tabStyle = (t: string) => ({
    padding: '10px 20px',
    cursor: 'pointer' as const,
    borderBottom: tab === t ? '3px solid #4CAF50' : '3px solid transparent',
    background: tab === t ? '#e8f5e9' : 'transparent',
    fontWeight: tab === t ? 'bold' as const : 'normal' as const,
    border: 'none',
    fontSize: '16px',
  })

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #ccc', marginBottom: 20 }}>
        <button style={tabStyle('addtwo')} onClick={() => setTab('addtwo')}>AddTwo</button>
        <button style={tabStyle('creditscore')} onClick={() => setTab('creditscore')}>Credit Score Gate</button>
        <button style={tabStyle('attested')} onClick={() => setTab('attested')}>Attested Compute</button>
      </div>

      {tab === 'addtwo' && (
        <IncoTest
          chain={anvil}
          pepper="testnet"
          privateKey={state.privateKey}
          hostChainRpcUrl={HOST_CHAIN_RPC}
          value={BigInt(100)}
          addTwoAddress={state.addTwoAddress}
        />
      )}

      {tab === 'creditscore' && (
        <CreditScoreGateTest
          chain={anvil}
          pepper="testnet"
          privateKey={state.privateKey}
          hostChainRpcUrl={HOST_CHAIN_RPC}
          creditScore={BigInt(800)}
          gateAddress={state.creditScoreGateAddress}
        />
      )}

      {tab === 'attested' && (
        <AttestedComputeDemoTest
          chain={anvil}
          pepper="testnet"
          privateKey={state.privateKey}
          hostChainRpcUrl={HOST_CHAIN_RPC}
          value={BigInt(42)}
          scalar={BigInt(42)}
          demoAddress={state.attestedComputeDemoAddress}
        />
      )}
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

