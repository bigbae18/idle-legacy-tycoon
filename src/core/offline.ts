import { OFFLINE_CAP_MS } from './data/offline'
import { advanceCycles } from './tick'
import type { BusinessDefinition, GameState } from './types'

/** Resultado de liquidar un periodo fuera: para aplicar el estado y alimentar el modal de retorno. */
export interface OfflineSummary {
  /** Tiempo fuera reconocido (ya capado al tope), en ms. */
  elapsedMs: number
  /** Sustento cobrado mientras no estabas (base del futuro rewarded ×2, R9). */
  earned: number
  /** Estado resultante, con los ciclos completados cobrados y en reposo. */
  state: GameState
}

/**
 * Liquida el tiempo fuera por timestamp absoluto (GDD §7): delta negativo → 0; tope
 * configurable (base en `core/data/offline.ts`, ampliable por el árbol del Legado).
 * Sin automatización (R4), lo único que produce offline son los ciclos ya lanzados,
 * que avanzan con el tiempo real y completan una sola vez. El mismo flujo liquida
 * los huecos >60 s del tick online (pestaña suspendida — cierre del bug 3, §10).
 */
export function settleOffline(
  state: GameState,
  savedAt: number,
  now: number,
  catalog: BusinessDefinition[],
  capMs = OFFLINE_CAP_MS,
): OfflineSummary {
  const elapsedMs = Math.min(Math.max(now - savedAt, 0), capMs)
  if (elapsedMs === 0) {
    return { elapsedMs: 0, earned: 0, state }
  }

  const advanced = advanceCycles(state, elapsedMs, catalog)
  return { elapsedMs, earned: advanced.earned, state: advanced.state }
}
