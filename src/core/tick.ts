import { cycleDurationMs, outputPerCycle } from './businesses'
import type { BusinessDefinition, BusinessState, GameState } from './types'

/**
 * Tope de delta por tick online (GDD §7 y bug 3 del §10): un delta mayor significa
 * pestaña suspendida/dormida, y ese tiempo lo liquida el flujo offline, no el tick.
 */
export const MAX_TICK_DELTA_MS = 60_000

const EMPTY: BusinessState = { count: 0, purchased: 0, cycleElapsedMs: null }

/**
 * Motor compartido de ciclos (tick online y flujo offline): avanza los ciclos activos
 * `elapsedMs` milisegundos. Un ciclo completado acredita su producción — moneda si es
 * el primer eslabón de la cadena, unidades del negocio ANTERIOR si es uno superior
 * (cascada R2.5) — y deja el negocio en reposo. Sin automatización (R4) no se relanza
 * solo. Los cobros usan las unidades PRE-tick (semántica de snapshot: determinista aunque
 * varios eslabones completen a la vez). R4 enchufará aquí la producción automatizada.
 */
export function advanceCycles(
  state: GameState,
  elapsedMs: number,
  catalog: BusinessDefinition[],
): { state: GameState; earned: number } {
  let earned = 0
  let anyCycleActive = false
  const businesses = { ...state.businesses }

  for (const [index, business] of catalog.entries()) {
    const current = state.businesses[business.id]
    if (!current || current.cycleElapsedMs === null) continue

    anyCycleActive = true
    const elapsed = current.cycleElapsedMs + elapsedMs
    if (elapsed >= cycleDurationMs(business, current.count)) {
      const output = outputPerCycle(business, current.count)
      if (index === 0) {
        earned += output
      } else {
        // las unidades producidas suben count pero NO purchased: producir no encarece
        const targetId = catalog[index - 1].id
        const target = businesses[targetId] ?? EMPTY
        businesses[targetId] = { ...target, count: target.count + output }
      }
      businesses[business.id] = { ...businesses[business.id], cycleElapsedMs: null }
    } else {
      businesses[business.id] = { ...businesses[business.id], cycleElapsedMs: elapsed }
    }
  }

  if (!anyCycleActive) {
    return { state, earned: 0 }
  }

  return { state: { currency: state.currency + earned, businesses }, earned }
}

/** Avanza el estado un tick online, con el delta capado a MAX_TICK_DELTA_MS. */
export function tick(state: GameState, deltaMs: number, catalog: BusinessDefinition[]): GameState {
  const clampedDelta = Math.min(Math.max(deltaMs, 0), MAX_TICK_DELTA_MS)
  if (clampedDelta === 0) {
    return state
  }

  return advanceCycles(state, clampedDelta, catalog).state
}
