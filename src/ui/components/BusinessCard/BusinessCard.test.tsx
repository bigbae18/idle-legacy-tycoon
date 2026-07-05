import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BusinessCard, type BusinessCardData } from './BusinessCard'

const BASE: BusinessCardData = {
  id: 'hoguera',
  name: 'Hoguera',
  level: 3,
  outputPerCycle: 18,
  cycleDurationMs: 6000,
  cycleProgress: null,
  nextMilestone: { level: 10, effect: 'production', multiplier: 2 },
  purchase: { count: 1, cost: 84, canAfford: true },
}

function renderCard(overrides: Partial<BusinessCardData> = {}, handlers = {}) {
  const props = {
    business: { ...BASE, ...overrides },
    onTap: vi.fn(),
    onPurchase: vi.fn(),
    ...handlers,
  }
  render(
    <ul>
      <BusinessCard {...props} />
    </ul>,
  )
  return props
}

describe('BusinessCard', () => {
  it('muestra nombre, nivel, producción por ciclo y duración del ciclo', () => {
    renderCard()

    expect(screen.getByText('Hoguera')).toBeInTheDocument()
    expect(screen.getByText('Nv. 3')).toBeInTheDocument()
    expect(screen.getByText(/\+18/)).toBeInTheDocument()
    expect(screen.getByText(/6s/)).toBeInTheDocument()
  })

  it('marca el próximo hito de producción', () => {
    renderCard()

    expect(screen.getByText(/Nv\. 10/)).toBeInTheDocument()
    expect(screen.getByText(/producción ×2/)).toBeInTheDocument()
  })

  it('marca el próximo hito de velocidad con su texto propio', () => {
    renderCard({ nextMilestone: { level: 25, effect: 'speed', multiplier: 2 } })

    expect(screen.getByText(/ciclo ×2 más rápido/)).toBeInTheDocument()
  })

  it('con todos los hitos conseguidos lo dice en vez de romperse', () => {
    renderCard({ nextMilestone: null })

    expect(screen.getByText(/Hitos completos/)).toBeInTheDocument()
  })

  it('el tap notifica el id del negocio', () => {
    const { onTap } = renderCard()

    fireEvent.click(screen.getByRole('button', { name: 'Recolectar Hoguera' }))

    expect(onTap).toHaveBeenCalledOnce()
    expect(onTap).toHaveBeenCalledWith('hoguera')
  })

  it('en reposo la barra de progreso está a 0', () => {
    renderCard()

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('con ciclo en curso el tap se deshabilita y la barra refleja el progreso', () => {
    renderCard({ cycleProgress: 0.5 })

    expect(screen.getByRole('button', { name: 'Recolectar Hoguera' })).toBeDisabled()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  })

  it('la compra notifica el id y muestra lote y coste', () => {
    const { onPurchase } = renderCard({ purchase: { count: 10, cost: 1200, canAfford: true } })

    const buyButton = screen.getByRole('button', { name: 'Comprar Hoguera' })
    expect(buyButton).toHaveTextContent('×10')
    expect(buyButton).toHaveTextContent('1.2K')

    fireEvent.click(buyButton)

    expect(onPurchase).toHaveBeenCalledWith('hoguera')
  })

  it('sin fondos el botón de compra se deshabilita', () => {
    renderCard({ purchase: { count: 1, cost: 84, canAfford: false } })

    expect(screen.getByRole('button', { name: 'Comprar Hoguera' })).toBeDisabled()
  })

  it('a nivel 0 el negocio está bloqueado: sin botón de tap, la compra lo desbloquea', () => {
    renderCard({ level: 0 })

    expect(screen.queryByRole('button', { name: 'Recolectar Hoguera' })).not.toBeInTheDocument()
    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comprar Hoguera' })).toBeInTheDocument()
  })
})
