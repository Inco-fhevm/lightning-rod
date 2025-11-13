import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import HelloWorld from '../src/HW.tsx'

test('renders name', () => {
  render(<HelloWorld name="Vitest" />)

  expect(screen.getByText('Hello Vitest x1!')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Increment' }))

  expect(screen.getByText('Hello Vitest x2!')).toBeInTheDocument()
})