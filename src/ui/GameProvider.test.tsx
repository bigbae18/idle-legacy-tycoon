import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GameProvider } from './GameProvider'
import { useGame } from './hooks/useGame'

function Consumer() {
  const { state } = useGame()
  return <span>{state.amount}</span>
}

describe('GameProvider', () => {
  it('expone el estado inicial a través de useGame', () => {
    render(
      <GameProvider initialState={{ amount: 7, rate: 0, upgradeLevel: 0 }}>
        <Consumer />
      </GameProvider>,
    )

    expect(screen.getByText('7')).toBeInTheDocument()
  })
})
