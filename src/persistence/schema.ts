import type { GameState } from '../core/types'

export const CURRENT_SCHEMA_VERSION = 1
export const STORAGE_KEY = 'idle-legacy-tycoon:save'

export interface SaveFile {
  schemaVersion: number
  state: GameState
}
