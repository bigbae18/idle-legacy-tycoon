import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BusinessCard, type BusinessCardData } from './BusinessCard'

const BASE: BusinessCardData = {
  id: 'hoguera',
  name: 'Hogueras',
  owned: 3,
  producesLabel: 'Recolectores',
  outputPerCycle: 3,
  cycleDurationMs: 6000,
  cycleProgress: null,
  nextMilestone: { count: 10, effect: 'production', multiplier: 2 },
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
  it('muestra nombre, unidades poseídas y qué produce por ciclo (la cadena, R2.5)', () => {
    renderCard()

    expect(screen.getByText('Hogueras')).toBeInTheDocument()
    expect(screen.getByText('×3')).toBeInTheDocument()
    expect(screen.getByText(/\+3 Recolectores/)).toBeInTheDocument()
    expect(screen.getByText(/6s/)).toBeInTheDocument()
  })

  it('formatea las unidades grandes con sufijo', () => {
    renderCard({ owned: 45_200 })

    expect(screen.getByText('×45.2K')).toBeInTheDocument()
  })

  it('marca el próximo hito por unidades', () => {
    renderCard()

    expect(screen.getByText(/10 uds\./)).toBeInTheDocument()
    expect(screen.getByText(/producción ×2/)).toBeInTheDocument()
  })

  it('marca el próximo hito de velocidad con su texto propio', () => {
    renderCard({ nextMilestone: { count: 25, effect: 'speed', multiplier: 2 } })

    expect(screen.getByText(/ciclo ×2 más rápido/)).toBeInTheDocument()
  })

  it('con todos los hitos conseguidos lo dice en vez de romperse', () => {
    renderCard({ nextMilestone: null })

    expect(screen.getByText(/Hitos completos/)).toBeInTheDocument()
  })

  it('el tap notifica el id del negocio', () => {
    const { onTap } = renderCard()

    fireEvent.click(screen.getByRole('button', { name: 'Recolectar Hogueras' }))

    expect(onTap).toHaveBeenCalledOnce()
    expect(onTap).toHaveBeenCalledWith('hoguera')
  })

  it('con ciclo en curso el tap se deshabilita y la barra refleja el progreso', () => {
    renderCard({ cycleProgress: 0.5 })

    expect(screen.getByRole('button', { name: 'Recolectar Hogueras' })).toBeDisabled()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  })

  it('la compra notifica el id y muestra lote y coste', () => {
    const { onPurchase } = renderCard({ purchase: { count: 10, cost: 1200, canAfford: true } })

    const buyButton = screen.getByRole('button', { name: 'Comprar Hogueras' })
    expect(buyButton).toHaveTextContent('×10')
    expect(buyButton).toHaveTextContent('1.2K')

    fireEvent.click(buyButton)

    expect(onPurchase).toHaveBeenCalledWith('hoguera')
  })

  it('sin fondos el botón de compra se deshabilita', () => {
    renderCard({ purchase: { count: 1, cost: 84, canAfford: false } })

    expect(screen.getByRole('button', { name: 'Comprar Hogueras' })).toBeDisabled()
  })

  it('a 0 unidades el negocio está bloqueado: sin botón de tap, la compra lo desbloquea', () => {
    renderCard({ owned: 0 })

    expect(screen.queryByRole('button', { name: 'Recolectar Hogueras' })).not.toBeInTheDocument()
    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comprar Hogueras' })).toHaveTextContent('Desbloquear')
  })
})
