import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BusinessList } from './BusinessList'

const ROWS = [
  { id: 'bayas', name: 'Recolección de bayas', level: 3, cost: 42, canAfford: true },
  { id: 'hoguera', name: 'Hoguera', level: 0, cost: 60, canAfford: false },
]

describe('BusinessList', () => {
  it('muestra nombre, nivel y coste de cada negocio', () => {
    render(<BusinessList businesses={ROWS} onPurchase={() => {}} />)

    expect(screen.getByText('Recolección de bayas')).toBeInTheDocument()
    expect(screen.getByText(/Nv\. 3/)).toBeInTheDocument()
    expect(screen.getByText(/42/)).toBeInTheDocument()
    expect(screen.getByText('Hoguera')).toBeInTheDocument()
  })

  it('deshabilita el botón de un negocio que no se puede pagar', () => {
    render(<BusinessList businesses={ROWS} onPurchase={() => {}} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeEnabled()
    expect(buttons[1]).toBeDisabled()
  })

  it('al comprar, notifica el id del negocio pulsado', () => {
    const onPurchase = vi.fn()
    render(<BusinessList businesses={ROWS} onPurchase={onPurchase} />)

    fireEvent.click(screen.getAllByRole('button')[0])

    expect(onPurchase).toHaveBeenCalledOnce()
    expect(onPurchase).toHaveBeenCalledWith('bayas')
  })
})
