import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { GameProvider } from './GameProvider'
import { useGame } from './hooks/useGame'
import { save } from '../persistence/save'
import { localStorageAdapter } from '../persistence/storageAdapter'

function Consumer() {
  const { state } = useGame()
  return <span>{state.currency}</span>
}

describe('GameProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('sin guardado previo, expone el initialState recibido', () => {
    render(
      <GameProvider initialState={{ currency: 7, businesses: { bayas: 1 } }}>
        <Consumer />
      </GameProvider>,
    )

    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('con guardado previo, carga ese estado en vez del initialState', () => {
    save({ currency: 123, businesses: { bayas: 4 } }, localStorageAdapter)

    render(
      <GameProvider initialState={{ currency: 0, businesses: { bayas: 1 } }}>
        <Consumer />
      </GameProvider>,
    )

    expect(screen.getByText('123')).toBeInTheDocument()
  })
})
