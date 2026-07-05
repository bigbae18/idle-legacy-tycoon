import type { GameState } from '../core/types'

export const CURRENT_SCHEMA_VERSION = 4
export const STORAGE_KEY = 'idle-legacy-tycoon:save'

export interface SaveFile {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION
  /** Timestamp (ms epoch) del momento del guardado — lo consumirá el flujo offline (R2). */
  savedAt: number
  state: GameState
}
