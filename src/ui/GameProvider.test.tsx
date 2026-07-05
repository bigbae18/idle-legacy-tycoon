import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { GameProvider } from './GameProvider'
import { useGame } from './hooks/useGame'
import { save } from '../persistence/save'
import { localStorageAdapter } from '../persistence/storageAdapter'
import type { GameState } from '../core/types'

function Consumer() {
  const { state } = useGame()
  return <span>{state.currency}</span>
}

const INITIAL: GameState = {
  currency: 7,
  businesses: { bayas: { level: 1, cycleElapsedMs: null } },
}

describe('GameProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('sin guardado previo, expone el initialState recibido', () => {
    render(
      <GameProvider initialState={INITIAL}>
        <Consumer />
      </GameProvider>,
    )

    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('con guardado previo, carga ese estado en vez del initialState', () => {
    save(
      { currency: 123, businesses: { bayas: { level: 4, cycleElapsedMs: null } } },
      localStorageAdapter,
    )

    render(
      <GameProvider initialState={{ ...INITIAL, currency: 0 }}>
        <Consumer />
      </GameProvider>,
    )

    expect(screen.getByText('123')).toBeInTheDocument()
  })
})
