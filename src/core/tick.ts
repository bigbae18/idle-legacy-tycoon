import type { GameState } from './types'

/** Avanza el estado `deltaMs` milisegundos. Pura: mismo input, mismo output. */
export function tick(state: GameState, deltaMs: number): GameState {
  return {
    ...state,
    amount: state.amount + state.rate * deltaMs,
  }
}
