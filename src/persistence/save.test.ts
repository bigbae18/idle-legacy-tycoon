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
  it('guarda el estado junto con la versión de esquema actual', () => {
    const adapter = createMemoryAdapter()
    const state: GameState = { amount: 42, rate: 3, upgradeLevel: 2 }

    save(state, adapter)

    const raw = adapter.data.get(STORAGE_KEY)
    expect(raw).toBeDefined()
    const parsed = JSON.parse(raw as string)
    expect(parsed.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(parsed.state).toEqual(state)
  })
})
