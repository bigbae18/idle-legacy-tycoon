import type { GameState } from './types'

const BASE_COST = 10
const COST_GROWTH = 1.15
const RATE_PER_LEVEL = 1

/** Coste de comprar la mejora estando en `level` (el nivel actual, antes de comprarla). */
export function upgradeCost(level: number): number {
  return Math.ceil(BASE_COST * COST_GROWTH ** level)
}

/** Compra la mejora si hay fondos suficientes; si no, devuelve el estado sin cambios. */
export function purchaseUpgrade(state: GameState): GameState {
  const cost = upgradeCost(state.upgradeLevel)
  if (state.amount < cost) {
    return state
  }

  return {
    ...state,
    amount: state.amount - cost,
    upgradeLevel: state.upgradeLevel + 1,
    rate: state.rate + RATE_PER_LEVEL,
  }
}
