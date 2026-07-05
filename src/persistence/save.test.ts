import { describe, expect, it } from 'vitest'
import { clearSave, save } from './save'
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
    removeItem: (key) => {
      data.delete(key)
    },
  }
}

describe('save', () => {
  it('guarda el estado con la versión de esquema actual y el timestamp del guardado', () => {
    const adapter = createMemoryAdapter()
    const state: GameState = {
      currency: 42,
      businesses: { bayas: { level: 2, cycleElapsedMs: 500 } },
    }
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

describe('clearSave', () => {
  it('borra el save guardado (reiniciar partida, R1)', () => {
    const adapter = createMemoryAdapter()
    save({ currency: 42, businesses: {} }, adapter)

    clearSave(adapter)

    expect(adapter.data.has(STORAGE_KEY)).toBe(false)
  })

  it('sin save previo no revienta', () => {
    const adapter = createMemoryAdapter()

    expect(() => clearSave(adapter)).not.toThrow()
  })
})
