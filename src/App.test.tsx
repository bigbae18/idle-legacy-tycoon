import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza el nombre del proyecto', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Idle Legacy Tycoon' })).toBeInTheDocument()
  })

  it('renderiza los 5 negocios de la Prehistoria', () => {
    render(<App />)

    expect(screen.getByText('Recolección de bayas')).toBeInTheDocument()
    expect(screen.getByText('Hoguera')).toBeInTheDocument()
    expect(screen.getByText('Caza mayor')).toBeInTheDocument()
    expect(screen.getByText('Taller de sílex')).toBeInTheDocument()
    expect(screen.getByText('Pinturas rupestres')).toBeInTheDocument()
  })
})
