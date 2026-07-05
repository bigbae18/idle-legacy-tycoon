import { PREHISTORIA } from '../../core/data/prehistoria'
import type { BusinessState, GameState } from '../../core/types'
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

// ── v1 (MVP-4): un solo recurso, una sola mejora, rate derivado persistido ──────────

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

// ── v2 (R0): multi-negocio con niveles planos, sin estado de ciclo ──────────────────

interface StateV2 {
  currency: number
  businesses: Record<string, number>
}

function validateStateV2(value: unknown): StateV2 | null {
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

/** v1 → v2: amount→currency, upgradeLevel→niveles extra de bayas sobre el nivel 1 gratis. */
function migrateV1ToV2(stateV1: StateV1): StateV2 {
  const businesses: Record<string, number> = {}
  for (const [index, business] of PREHISTORIA.entries()) {
    businesses[business.id] = index === 0 ? 1 : 0
  }
  businesses.bayas += stateV1.upgradeLevel
  return { currency: stateV1.amount, businesses }
}

// ── v3 (R1): niveles + progreso del ciclo en curso por negocio ──────────────────────

function validateStateV3(value: unknown): GameState | null {
  if (!isRecord(value)) return null
  if (!isFiniteNonNegative(value.currency)) return null
  if (!isRecord(value.businesses)) return null

  const businesses: Record<string, BusinessState> = {}
  for (const [id, entry] of Object.entries(value.businesses)) {
    if (!isRecord(entry)) return null
    if (!isLevel(entry.level)) return null
    // campo ausente = negocio en reposo (defaultable sin riesgo); presente pero roto = envenenado
    const cycleElapsedMs = entry.cycleElapsedMs ?? null
    if (cycleElapsedMs !== null && !isFiniteNonNegative(cycleElapsedMs)) return null
    businesses[id] = { level: entry.level, cycleElapsedMs }
  }

  return { currency: value.currency, businesses }
}

/** v2 → v3: cada nivel plano pasa a {level, cycleElapsedMs: null} (todos en reposo). */
function migrateV2ToV3(stateV2: StateV2): GameState {
  const businesses: Record<string, BusinessState> = {}
  for (const [id, level] of Object.entries(stateV2.businesses)) {
    businesses[id] = { level, cycleElapsedMs: null }
  }
  return { currency: stateV2.currency, businesses }
}

/**
 * Lleva cualquier save conocido a la versión actual, validando cada forma por el camino
 * y encadenando migraciones (v1→v2→v3). Devuelve null si el save es irrecuperable
 * (versión desconocida o datos envenenados): el llamante decide el fallback.
 * Pura: `now` se inyecta para que sea testeable.
 */
export function migrateToCurrent(parsed: unknown, now: number): SaveFile | null {
  if (!isRecord(parsed)) return null

  if (parsed.schemaVersion === 1) {
    const stateV1 = validateStateV1(parsed.state)
    if (!stateV1) return null
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      savedAt: now,
      state: migrateV2ToV3(migrateV1ToV2(stateV1)),
    }
  }

  if (parsed.schemaVersion === 2) {
    const stateV2 = validateStateV2(parsed.state)
    if (!stateV2) return null
    const savedAt = isFiniteNonNegative(parsed.savedAt) ? parsed.savedAt : now
    return { schemaVersion: CURRENT_SCHEMA_VERSION, savedAt, state: migrateV2ToV3(stateV2) }
  }

  if (parsed.schemaVersion === CURRENT_SCHEMA_VERSION) {
    const state = validateStateV3(parsed.state)
    if (!state) return null
    const savedAt = isFiniteNonNegative(parsed.savedAt) ? parsed.savedAt : now
    return { schemaVersion: CURRENT_SCHEMA_VERSION, savedAt, state }
  }

  return null
}
