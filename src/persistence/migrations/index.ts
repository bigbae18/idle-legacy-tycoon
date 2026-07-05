import { createInitialState } from '../../core/businesses'
import { PREHISTORIA } from '../../core/data/prehistoria'
import type { GameState } from '../../core/types'
import { CURRENT_SCHEMA_VERSION, type SaveFile } from '../schema'

function isRecord(value: unknown): value is Record<string, unknown> {
  // typeof null === 'object': el guard explícito de null es el fix del bug 1 (GDD §10)
  return typeof value === 'object' && value !== null
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isLevel(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function validateStateV2(value: unknown): GameState | null {
  if (!isRecord(value)) return null
  if (!isFiniteNonNegative(value.currency)) return null
  if (!isRecord(value.businesses)) return null

  const businesses: Record<string, number> = {}
  for (const [id, level] of Object.entries(value.businesses)) {
    if (!isLevel(level)) return null
    businesses[id] = level
  }

  return { currency: value.currency, businesses }
}

interface StateV1 {
  amount: number
  upgradeLevel: number
}

function validateStateV1(value: unknown): StateV1 | null {
  if (!isRecord(value)) return null
  if (!isFiniteNonNegative(value.amount)) return null
  if (!isLevel(value.upgradeLevel)) return null
  // rate no se valida: era estado derivado y se descarta en la migración (bug 2 del GDD §10)
  return { amount: value.amount, upgradeLevel: value.upgradeLevel }
}

/** v1 (mejora única de MVP-3) → v2: amount→currency, upgradeLevel→niveles extra de bayas sobre el nivel 1 gratis. */
function migrateV1ToV2(stateV1: StateV1, now: number): SaveFile {
  const state = createInitialState(PREHISTORIA)
  state.currency = stateV1.amount
  state.businesses.bayas += stateV1.upgradeLevel
  return { schemaVersion: CURRENT_SCHEMA_VERSION, savedAt: now, state }
}

/**
 * Lleva cualquier save conocido a la versión actual, validando cada forma por el camino.
 * Devuelve null si el save es irrecuperable (versión desconocida o datos envenenados):
 * el llamante decide el fallback. Pura: `now` se inyecta para que sea testeable.
 */
export function migrateToCurrent(parsed: unknown, now: number): SaveFile | null {
  if (!isRecord(parsed)) return null

  if (parsed.schemaVersion === 1) {
    const stateV1 = validateStateV1(parsed.state)
    return stateV1 ? migrateV1ToV2(stateV1, now) : null
  }

  if (parsed.schemaVersion === CURRENT_SCHEMA_VERSION) {
    const state = validateStateV2(parsed.state)
    if (!state) return null
    const savedAt = isFiniteNonNegative(parsed.savedAt) ? parsed.savedAt : now
    return { schemaVersion: CURRENT_SCHEMA_VERSION, savedAt, state }
  }

  return null
}
