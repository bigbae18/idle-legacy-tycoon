import type { BusinessState, GameState } from '../../core/types'
import { CURRENT_SCHEMA_VERSION, type SaveFile } from '../schema'

function isRecord(value: unknown): value is Record<string, unknown> {
  // typeof null === 'object': el guard explícito de null es el fix del bug 1 (GDD §10)
  return typeof value === 'object' && value !== null
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isCount(value: unknown): value is number {
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
  if (!isCount(value.upgradeLevel)) return null
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
    if (!isCount(level)) return null
    businesses[id] = level
  }

  return { currency: value.currency, businesses }
}

/**
 * v1 → v2: amount→currency, upgradeLevel→niveles extra de 'bayas' sobre el nivel 1 gratis.
 * Los ids son los HISTÓRICOS de la era v2 (congelados aquí a propósito, no el catálogo
 * vivo): v3→v4 se encarga del renombrado posterior.
 */
function migrateV1ToV2(stateV1: StateV1): StateV2 {
  return {
    currency: stateV1.amount,
    businesses: { bayas: 1 + stateV1.upgradeLevel, hoguera: 0, caza: 0, silex: 0, pinturas: 0 },
  }
}

// ── v3 (R1/R2): nivel único + progreso del ciclo por negocio ────────────────────────

interface BusinessStateV3 {
  level: number
  cycleElapsedMs: number | null
}

interface StateV3 {
  currency: number
  businesses: Record<string, BusinessStateV3>
}

function validateStateV3(value: unknown): StateV3 | null {
  if (!isRecord(value)) return null
  if (!isFiniteNonNegative(value.currency)) return null
  if (!isRecord(value.businesses)) return null

  const businesses: Record<string, BusinessStateV3> = {}
  for (const [id, entry] of Object.entries(value.businesses)) {
    if (!isRecord(entry)) return null
    if (!isCount(entry.level)) return null
    const cycleElapsedMs = entry.cycleElapsedMs ?? null
    if (cycleElapsedMs !== null && !isFiniteNonNegative(cycleElapsedMs)) return null
    businesses[id] = { level: entry.level, cycleElapsedMs }
  }

  return { currency: value.currency, businesses }
}

/** v2 → v3: cada nivel plano pasa a {level, cycleElapsedMs: null} (todos en reposo). */
function migrateV2ToV3(stateV2: StateV2): StateV3 {
  const businesses: Record<string, BusinessStateV3> = {}
  for (const [id, level] of Object.entries(stateV2.businesses)) {
    businesses[id] = { level, cycleElapsedMs: null }
  }
  return { currency: stateV2.currency, businesses }
}

// ── v4 (R2.5, cadena): count/purchased separados y primer negocio 'recolectores' ────

function validateStateV4(value: unknown): GameState | null {
  if (!isRecord(value)) return null
  if (!isFiniteNonNegative(value.currency)) return null
  if (!isRecord(value.businesses)) return null

  const businesses: Record<string, BusinessState> = {}
  for (const [id, entry] of Object.entries(value.businesses)) {
    if (!isRecord(entry)) return null
    if (!isCount(entry.count)) return null
    // defaultables sin riesgo: sin ciclo = reposo; sin purchased = todo comprado (precio conservador)
    const purchased = entry.purchased ?? entry.count
    if (!isCount(purchased)) return null
    const cycleElapsedMs = entry.cycleElapsedMs ?? null
    if (cycleElapsedMs !== null && !isFiniteNonNegative(cycleElapsedMs)) return null
    businesses[id] = { count: entry.count, purchased, cycleElapsedMs }
  }

  return { currency: value.currency, businesses }
}

/**
 * v3 → v4: level pasa a count Y purchased (lo poseído hasta ahora se considera comprado,
 * así el precio continúa donde estaba) y el primer negocio se renombra bayas→recolectores
 * (en la cadena R2.5 "Bayas" es el recurso, no el negocio).
 */
function migrateV3ToV4(stateV3: StateV3): GameState {
  const businesses: Record<string, BusinessState> = {}
  for (const [id, entry] of Object.entries(stateV3.businesses)) {
    const newId = id === 'bayas' ? 'recolectores' : id
    businesses[newId] = {
      count: entry.level,
      purchased: entry.level,
      cycleElapsedMs: entry.cycleElapsedMs,
    }
  }
  return { currency: stateV3.currency, businesses }
}

/**
 * Lleva cualquier save conocido a la versión actual, validando cada forma por el camino
 * y encadenando migraciones (v1→v2→v3→v4). Devuelve null si el save es irrecuperable
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
      state: migrateV3ToV4(migrateV2ToV3(migrateV1ToV2(stateV1))),
    }
  }

  if (parsed.schemaVersion === 2) {
    const stateV2 = validateStateV2(parsed.state)
    if (!stateV2) return null
    const savedAt = isFiniteNonNegative(parsed.savedAt) ? parsed.savedAt : now
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      savedAt,
      state: migrateV3ToV4(migrateV2ToV3(stateV2)),
    }
  }

  if (parsed.schemaVersion === 3) {
    const stateV3 = validateStateV3(parsed.state)
    if (!stateV3) return null
    const savedAt = isFiniteNonNegative(parsed.savedAt) ? parsed.savedAt : now
    return { schemaVersion: CURRENT_SCHEMA_VERSION, savedAt, state: migrateV3ToV4(stateV3) }
  }

  if (parsed.schemaVersion === CURRENT_SCHEMA_VERSION) {
    const state = validateStateV4(parsed.state)
    if (!state) return null
    const savedAt = isFiniteNonNegative(parsed.savedAt) ? parsed.savedAt : now
    return { schemaVersion: CURRENT_SCHEMA_VERSION, savedAt, state }
  }

  return null
}
