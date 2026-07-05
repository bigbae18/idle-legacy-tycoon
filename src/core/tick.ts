import { cycleDurationMs, outputPerCycle } from './businesses'
import type { BusinessDefinition, GameState } from './types'

/**
 * Tope de delta por tick online (GDD §7 y bug 3 del §10): un delta mayor significa
 * pestaña suspendida/dormida, y ese tiempo lo liquida el flujo offline (R2), no el tick.
 */
export const MAX_TICK_DELTA_MS = 60_000

/**
 * Avanza los ciclos activos `deltaMs` milisegundos. Un ciclo completado cobra su
 * producción y deja el negocio en reposo — sin automatización (llega en R4) no se
 * relanza solo, así que como mucho se cobra un ciclo por negocio y tick.
 * Pura: mismo input, mismo output.
 */
export function tick(state: GameState, deltaMs: number, catalog: BusinessDefinition[]): GameState {
  const clampedDelta = Math.min(Math.max(deltaMs, 0), MAX_TICK_DELTA_MS)
  if (clampedDelta === 0) {
    return state
  }

  let currency = state.currency
  let anyCycleActive = false
  const businesses = { ...state.businesses }

  for (const business of catalog) {
    const current = state.businesses[business.id]
    if (!current || current.cycleElapsedMs === null) continue

    anyCycleActive = true
    const elapsed = current.cycleElapsedMs + clampedDelta
    if (elapsed >= cycleDurationMs(business, current.level)) {
      currency += outputPerCycle(business, current.level)
      businesses[business.id] = { ...current, cycleElapsedMs: null }
    } else {
      businesses[business.id] = { ...current, cycleElapsedMs: elapsed }
    }
  }

  if (!anyCycleActive) {
    return state
  }

  return { currency, businesses }
}
