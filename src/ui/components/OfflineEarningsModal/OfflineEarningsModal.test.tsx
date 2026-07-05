import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OfflineEarningsModal } from './OfflineEarningsModal'

describe('OfflineEarningsModal', () => {
  it('muestra el desglose: cobro formateado con el recurso de la era y tiempo fuera (GDD §7)', () => {
    render(
      <OfflineEarningsModal
        earned={12_500}
        elapsedMs={3 * 3_600_000 + 24 * 60_000}
        currencyName="Bayas"
        onClose={() => {}}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Ganancias offline' })).toBeInTheDocument()
    expect(screen.getByText(/Mientras no estabas/)).toBeInTheDocument()
    expect(screen.getByText(/\+12\.5K Bayas/)).toBeInTheDocument()
    expect(screen.getByText(/3h 24m/)).toBeInTheDocument()
  })

  it('el botón "Recoger" cierra el modal', () => {
    const onClose = vi.fn()
    render(
      <OfflineEarningsModal earned={5} elapsedMs={60_000} currencyName="Bayas" onClose={onClose} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Recoger' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
