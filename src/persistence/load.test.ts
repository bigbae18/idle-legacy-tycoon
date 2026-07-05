import { describe, expect, it } from 'vitest'
import { loadSave } from './load'
import { save } from './save'
import { STORAGE_KEY } from './schema'
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

const NOW = 1_751_800_000_000

describe('loadSave', () => {
  it('reproduce el estado y el savedAt guardados (el flujo offline vive de ese timestamp)', () => {
    const adapter = createMemoryAdapter()
    const state: GameState = {
      currency: 99,
      businesses: {
        recolectores: { count: 40, purchased: 4, cycleElapsedMs: 750 },
        hoguera: { count: 2, purchased: 2, cycleElapsedMs: null },
      },
    }
    save(state, adapter, NOW - 60_000)

    const result = loadSave(adapter, NOW)

    expect(result?.state).toEqual(state)
    expect(result?.savedAt).toBe(NOW - 60_000)
  })

  it('sin nada guardado devuelve null (el llamante decide el estado inicial)', () => {
    expect(loadSave(createMemoryAdapter(), NOW)).toBeNull()
  })

  it('JSON corrupto devuelve null', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(STORAGE_KEY, '{esto no es json valido')

    expect(loadSave(adapter, NOW)).toBeNull()
  })

  it('cadena vacía devuelve null', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(STORAGE_KEY, '')

    expect(loadSave(adapter, NOW)).toBeNull()
  })

  it('state:null devuelve null en vez de reventar (bug 1 del GDD §10)', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 4, savedAt: 1, state: null }))

    expect(loadSave(adapter, NOW)).toBeNull()
  })

  it('un save envenenado con NaN devuelve null (JSON serializa NaN como null)', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 4, savedAt: 1, state: { currency: NaN, businesses: {} } }),
    )

    expect(loadSave(adapter, NOW)).toBeNull()
  })

  it('un save v3 (R1/R2) se migra conservando su savedAt', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 3,
        savedAt: NOW - 5000,
        state: { currency: 42, businesses: { bayas: { level: 3, cycleElapsedMs: 800 } } },
      }),
    )

    const result = loadSave(adapter, NOW)

    expect(result?.savedAt).toBe(NOW - 5000)
    expect(result?.state.currency).toBe(42)
    expect(result?.state.businesses.recolectores).toEqual({
      count: 3,
      purchased: 3,
      cycleElapsedMs: 800,
    })
  })

  it('un save v1 antiguo se migra en vez de perderse (savedAt = ahora: sin timestamp no hay offline)', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, state: { amount: 500, rate: 0.006, upgradeLevel: 5 } }),
    )

    const result = loadSave(adapter, NOW)

    expect(result?.savedAt).toBe(NOW)
    expect(result?.state.currency).toBe(500)
    expect(result?.state.businesses.recolectores).toEqual({
      count: 6,
      purchased: 6,
      cycleElapsedMs: null,
    })
  })
})
