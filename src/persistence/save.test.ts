import { describe, expect, it } from 'vitest'
import { save } from './save'
import { CURRENT_SCHEMA_VERSION, STORAGE_KEY } from './schema'
import type { StorageAdapter } from './storageAdapter'
import type { GameState } from '../core/types'

function createMemoryAdapter(): StorageAdapter & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
}

describe('save', () => {
  it('guarda el estado con la versión de esquema actual y el timestamp del guardado', () => {
    const adapter = createMemoryAdapter()
    const state: GameState = { currency: 42, businesses: { bayas: 2 } }
    const now = 1_751_800_000_000

    save(state, adapter, now)

    const raw = adapter.data.get(STORAGE_KEY)
    expect(raw).toBeDefined()
    const parsed = JSON.parse(raw as string)
    expect(parsed.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(parsed.savedAt).toBe(now)
    expect(parsed.state).toEqual(state)
  })
})
