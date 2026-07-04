import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('App', () => {
  it('renders the project name', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Legado' })).toBeInTheDocument()
  })
})
