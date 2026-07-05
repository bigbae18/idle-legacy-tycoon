import { migrateToCurrent } from './migrations'
import { STORAGE_KEY, type SaveFile } from './schema'
import type { StorageAdapter } from './storageAdapter'

/**
 * Carga el save completo (estado + savedAt, que consume el flujo offline), migrándolo
 * a la versión actual si hace falta. Devuelve null si no hay save o es irrecuperable
 * (corrupto, envenenado, versión desconocida): el llamante decide el estado inicial.
 */
export function loadSave(adapter: StorageAdapter, now = Date.now()): SaveFile | null {
  const raw = adapter.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    return migrateToCurrent(parsed, now)
  } catch {
    return null
  }
}
