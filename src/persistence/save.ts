import type { GameState } from '../core/types'
import { CURRENT_SCHEMA_VERSION, STORAGE_KEY, type SaveFile } from './schema'
import type { StorageAdapter } from './storageAdapter'

export function save(state: GameState, adapter: StorageAdapter): void {
  const saveFile: SaveFile = { schemaVersion: CURRENT_SCHEMA_VERSION, state }
  adapter.setItem(STORAGE_KEY, JSON.stringify(saveFile))
}
