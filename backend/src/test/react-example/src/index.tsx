import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import IncoTest from './Inco.tsx'
import { anvil } from 'viem/chains'

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <IncoTest
      chain={anvil}
      pepper="testnet"
      privateKey="0x0"
      hostChainRpcUrl="http://localhost:8545"
      value={100n}
      addTwoAddress="0x0"
    />
  </StrictMode>,
)

