import type { GameState } from '../core/types'
import { STORAGE_KEY, type SaveFile } from './schema'
import type { StorageAdapter } from './storageAdapter'

function isSaveFileShape(value: unknown): value is SaveFile {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.schemaVersion === 'number' && typeof candidate.state === 'object'
}

/**
 * Sin migraciones todavía: solo existe schemaVersion=1. Cuando el esquema cambie de verdad
 * (MVP-7), aquí es donde se encadenarían las migraciones antes de devolver el estado.
 */
export function load(adapter: StorageAdapter, fallback: GameState): GameState {
  const raw = adapter.getItem(STORAGE_KEY)
  if (!raw) return fallback

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isSaveFileShape(parsed)) return fallback
    return parsed.state
  } catch {
    return fallback
  }
}
