import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { GameProvider } from './GameProvider'
import { useGame } from './hooks/useGame'
import { save } from '../persistence/save'
import { localStorageAdapter } from '../persistence/storageAdapter'
import type { GameState } from '../core/types'

function Consumer() {
  const { state, offlineSummary, dismissOfflineSummary } = useGame()
  return (
    <div>
      <span data-testid="currency">{state.currency}</span>
      <span data-testid="offline">{offlineSummary ? offlineSummary.earned : 'sin resumen'}</span>
      <button onClick={dismissOfflineSummary}>cerrar</button>
    </div>
  )
}

const INITIAL: GameState = {
  currency: 7,
  businesses: { recolectores: { count: 1, purchased: 1, cycleElapsedMs: null } },
}

describe('GameProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('sin guardado previo, expone el initialState recibido y sin resumen offline', () => {
    render(
      <GameProvider initialState={INITIAL}>
        <Consumer />
      </GameProvider>,
    )

    expect(screen.getByTestId('currency')).toHaveTextContent('7')
    expect(screen.getByTestId('offline')).toHaveTextContent('sin resumen')
  })

  it('con guardado previo, carga ese estado en vez del initialState', () => {
    save(
      { currency: 123, businesses: { recolectores: { count: 4, purchased: 4, cycleElapsedMs: null } } },
      localStorageAdapter,
    )

    render(
      <GameProvider initialState={{ ...INITIAL, currency: 0 }}>
        <Consumer />
      </GameProvider>,
    )

    expect(screen.getByTestId('currency')).toHaveTextContent('123')
  })

  it('al cargar, liquida el tiempo fuera: un ciclo lanzado completa, cobra y expone el resumen', () => {
    // 4 recolectores con ciclo lanzado, guardado hace 60s: el ciclo (2s) completó fuera → +4
    save(
      { currency: 10, businesses: { recolectores: { count: 4, purchased: 4, cycleElapsedMs: 0 } } },
      localStorageAdapter,
      Date.now() - 60_000,
    )

    render(
      <GameProvider initialState={INITIAL}>
        <Consumer />
      </GameProvider>,
    )

    expect(screen.getByTestId('currency')).toHaveTextContent('14')
    expect(screen.getByTestId('offline')).toHaveTextContent('4')
  })

  it('dismissOfflineSummary retira el resumen (cierra el modal)', () => {
    save(
      { currency: 0, businesses: { recolectores: { count: 4, purchased: 4, cycleElapsedMs: 0 } } },
      localStorageAdapter,
      Date.now() - 60_000,
    )

    render(
      <GameProvider initialState={INITIAL}>
        <Consumer />
      </GameProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'cerrar' }))

    expect(screen.getByTestId('offline')).toHaveTextContent('sin resumen')
  })

  it('tiempo fuera sin ciclos lanzados: sin resumen (el modal solo aparece con cobro)', () => {
    save(
      { currency: 50, businesses: { recolectores: { count: 4, purchased: 4, cycleElapsedMs: null } } },
      localStorageAdapter,
      Date.now() - 60_000,
    )

    render(
      <GameProvider initialState={INITIAL}>
        <Consumer />
      </GameProvider>,
    )

    expect(screen.getByTestId('currency')).toHaveTextContent('50')
    expect(screen.getByTestId('offline')).toHaveTextContent('sin resumen')
  })
})
