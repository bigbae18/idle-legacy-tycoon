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
  }
}

const FALLBACK: GameState = { amount: 0, rate: 1, upgradeLevel: 0 }

describe('load', () => {
  it('reproduce el estado guardado previamente', () => {
    const adapter = createMemoryAdapter()
    const state: GameState = { amount: 99, rate: 4, upgradeLevel: 5 }
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

  it('JSON válido pero con forma incorrecta cae al estado de respaldo', () => {
    const adapter = createMemoryAdapter()
    adapter.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))

    const result = load(adapter, FALLBACK)

    expect(result).toEqual(FALLBACK)
  })
})
