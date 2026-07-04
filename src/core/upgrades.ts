import { perSecondToPerMs } from './numbers'
import type { GameState } from './types'

const BASE_COST = 10
const COST_GROWTH = 1.15
/** +1/seg de producción por cada nivel comprado (valor de relleno, no economía final — ver plan-maestro.md). */
const RATE_PER_LEVEL = perSecondToPerMs(1)

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
