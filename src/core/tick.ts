import { productionPerMs } from './businesses'
import type { BusinessDefinition, GameState } from './types'

/**
 * Tope de delta por tick online (GDD §7 y bug 3 del §10): un delta mayor significa
 * pestaña suspendida/dormida, y ese tiempo lo liquida el flujo offline (R2), no el tick.
 */
export const MAX_TICK_DELTA_MS = 60_000

/** Avanza el estado `deltaMs` milisegundos. Pura: mismo input, mismo output. */
export function tick(state: GameState, deltaMs: number, catalog: BusinessDefinition[]): GameState {
  const clampedDelta = Math.min(Math.max(deltaMs, 0), MAX_TICK_DELTA_MS)
  if (clampedDelta === 0) {
    return state
  }

  return {
    ...state,
    currency: state.currency + productionPerMs(state, catalog) * clampedDelta,
  }
}
