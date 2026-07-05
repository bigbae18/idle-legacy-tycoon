import type { GameState } from '../core/types'
import { migrateToCurrent } from './migrations'
import { STORAGE_KEY } from './schema'
import type { StorageAdapter } from './storageAdapter'

/**
 * Carga el save, migrándolo a la versión actual si hace falta. Cualquier save
 * irrecuperable (corrupto, envenenado, versión desconocida) cae al fallback.
 */
export function load(adapter: StorageAdapter, fallback: GameState, now = Date.now()): GameState {
  const raw = adapter.getItem(STORAGE_KEY)
  if (!raw) return fallback

  try {
    const parsed: unknown = JSON.parse(raw)
    return migrateToCurrent(parsed, now)?.state ?? fallback
  } catch {
    return fallback
  }
}
