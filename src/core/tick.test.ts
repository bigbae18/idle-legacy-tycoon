import { describe, expect, it } from 'vitest'
import { tick } from './tick'
import type { GameState } from './types'

describe('tick', () => {
  it('delta=0 no modifica el estado', () => {
    const state: GameState = { amount: 10, rate: 2 }

    const result = tick(state, 0)

    expect(result.amount).toBe(10)
  })

  it('delta=N produce N×rate', () => {
    const state: GameState = { amount: 10, rate: 2 }

    const result = tick(state, 5)

    expect(result.amount).toBe(10 + 5 * 2)
  })

  it('rate=0 no produce nada, sea cual sea el delta', () => {
    const state: GameState = { amount: 10, rate: 0 }

    const result = tick(state, 1000)

    expect(result.amount).toBe(10)
  })
})
