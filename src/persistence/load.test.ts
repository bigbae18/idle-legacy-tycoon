import { describe, expect, it } from 'vitest'
import { load } from './load'
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

const FALLBACK: GameState = {
  currency: 0,
  businesses: { bayas: { level: 1, cycleElapsedMs: null } },
}

describe('load', () => {
  it('reproduce el estado guardado previamente, incluido el progreso de ciclo', () => {
    const adapter = createMemoryAdapter()
    const state: GameState = {
      currency: 99,
      businesses: {
        bayas: { level: 4, cycleElapsedMs: 750 },
        hoguera: { level: 2, cycleElapsedMs: null },
      },
    }
    save(state, adapter)

    const result = load(adapter, FALLBACK)

    expect(result).toEqual(state)
  })

  it('sin nada guardado, devuelve el estado de respaldo', () => {
    const adapter = createMemoryAdapter()

    const result = load(adapter, FALLBACK)

    expect(result).toEqual(FALLBACK)
  })

  it('JSON corrupto cae al estado de respaldo', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(STORAGE_KEY, '{esto no es json valido')

    const result = load(adapter, FALLBACK)

    expect(result).toEqual(FALLBACK)
  })

  it('cadena vacía cae al estado de respaldo', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(STORAGE_KEY, '')

    const result = load(adapter, FALLBACK)

    expect(result).toEqual(FALLBACK)
  })

  it('state:null cae al estado de respaldo en vez de reventar (bug 1 del GDD §10)', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 3, savedAt: 1, state: null }))

    const result = load(adapter, FALLBACK)

    expect(result).toEqual(FALLBACK)
  })

  it('un save envenenado con NaN cae al respaldo (JSON serializa NaN como null)', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 3, savedAt: 1, state: { currency: NaN, businesses: {} } }),
    )

    const result = load(adapter, FALLBACK)

    expect(result).toEqual(FALLBACK)
  })

  it('un save v2 (R0) se migra en vez de perderse', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 2,
        savedAt: 1,
        state: { currency: 42, businesses: { bayas: 3 } },
      }),
    )

    const result = load(adapter, FALLBACK)

    expect(result.currency).toBe(42)
    expect(result.businesses.bayas).toEqual({ level: 3, cycleElapsedMs: null })
  })

  it('un save v1 antiguo se migra en vez de perderse', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, state: { amount: 500, rate: 0.006, upgradeLevel: 5 } }),
    )

    const result = load(adapter, FALLBACK)

    expect(result.currency).toBe(500)
    expect(result.businesses.bayas).toEqual({ level: 6, cycleElapsedMs: null })
  })
})
