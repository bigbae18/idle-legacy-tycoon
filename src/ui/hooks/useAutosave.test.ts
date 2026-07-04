import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAutosave } from './useAutosave'
import { STORAGE_KEY } from '../../persistence/schema'
import type { GameState } from '../../core/types'

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('guarda el estado automáticamente pasado el intervalo', () => {
    const state: GameState = { amount: 50, rate: 1, upgradeLevel: 0 }
    renderHook(() => useAutosave(state))

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    vi.advanceTimersByTime(10_000)

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string).state).toEqual(state)
  })

  it('guarda inmediatamente al ocultar la pestaña', () => {
    const state: GameState = { amount: 7, rate: 0, upgradeLevel: 1 }
    renderHook(() => useAutosave(state))

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    })
    document.dispatchEvent(new Event('visibilitychange'))

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string).state).toEqual(state)
  })
})
