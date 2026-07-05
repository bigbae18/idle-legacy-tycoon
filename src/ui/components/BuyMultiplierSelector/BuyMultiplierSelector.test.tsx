import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BuyMultiplierSelector } from './BuyMultiplierSelector'

describe('BuyMultiplierSelector', () => {
  it('ofrece las tres opciones ×1, ×10 y ×Máx', () => {
    render(<BuyMultiplierSelector value={1} onChange={() => {}} />)

    expect(screen.getByRole('button', { name: '×1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '×10' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '×Máx' })).toBeInTheDocument()
  })

  it('marca la opción activa con aria-pressed', () => {
    render(<BuyMultiplierSelector value={10} onChange={() => {}} />)

    expect(screen.getByRole('button', { name: '×10' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '×1' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('al pulsar una opción notifica su valor', () => {
    const onChange = vi.fn()
    render(<BuyMultiplierSelector value={1} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '×10' }))
    expect(onChange).toHaveBeenCalledWith(10)

    fireEvent.click(screen.getByRole('button', { name: '×Máx' }))
    expect(onChange).toHaveBeenCalledWith('max')
  })
})
