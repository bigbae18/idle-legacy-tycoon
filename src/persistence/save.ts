import type { GameState } from '../core/types'
import { CURRENT_SCHEMA_VERSION, STORAGE_KEY, type SaveFile } from './schema'
import type { StorageAdapter } from './storageAdapter'

export function save(state: GameState, adapter: StorageAdapter, now = Date.now()): void {
  const saveFile: SaveFile = { schemaVersion: CURRENT_SCHEMA_VERSION, savedAt: now, state }
  adapter.setItem(STORAGE_KEY, JSON.stringify(saveFile))
}

/** Borra el save por completo (botón "reiniciar partida", R1). */
export function clearSave(adapter: StorageAdapter): void {
  adapter.removeItem(STORAGE_KEY)
}
