import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UpgradeList } from './UpgradeList'

describe('UpgradeList', () => {
  it('muestra el nivel y el coste actuales', () => {
    render(<UpgradeList level={3} cost={42} canAfford onPurchase={() => {}} />)

    expect(screen.getByText(/3/)).toBeInTheDocument()
    expect(screen.getByText(/42/)).toBeInTheDocument()
  })

  it('deshabilita el botón si no se puede pagar', () => {
    render(<UpgradeList level={0} cost={10} canAfford={false} onPurchase={() => {}} />)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('llama a onPurchase al pulsar si se puede pagar', () => {
    const onPurchase = vi.fn()
    render(<UpgradeList level={0} cost={10} canAfford onPurchase={onPurchase} />)

    fireEvent.click(screen.getByRole('button'))

    expect(onPurchase).toHaveBeenCalledOnce()
  })
})
