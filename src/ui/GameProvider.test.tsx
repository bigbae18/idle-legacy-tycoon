import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { GameProvider } from './GameProvider'
import { useGame } from './hooks/useGame'
import { save } from '../persistence/save'
import { localStorageAdapter } from '../persistence/storageAdapter'

function Consumer() {
  const { state } = useGame()
  return <span>{state.amount}</span>
}

describe('GameProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('sin guardado previo, expone el initialState recibido', () => {
    render(
      <GameProvider initialState={{ amount: 7, rate: 0, upgradeLevel: 0 }}>
        <Consumer />
      </GameProvider>,
    )

    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('con guardado previo, carga ese estado en vez del initialState', () => {
    save({ amount: 123, rate: 2, upgradeLevel: 4 }, localStorageAdapter)

    render(
      <GameProvider initialState={{ amount: 0, rate: 0, upgradeLevel: 0 }}>
        <Consumer />
      </GameProvider>,
    )

    expect(screen.getByText('123')).toBeInTheDocument()
  })
})
