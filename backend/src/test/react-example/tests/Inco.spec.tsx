import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import IncoTest from '../src/Inco.tsx'
import { anvil } from 'viem/chains'

test('renders IncoTest', async () => {
  
  render(<IncoTest chain={anvil} pepper="alphanet" privateKey="0x" hostChainRpcUrl="http://localhost:8545" value={100n} />)

  expect(screen.getByText('Inco Test')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Encrypt value' }))

  expect(await screen.findByText('Ciphertext:')).toBeInTheDocument()
})  