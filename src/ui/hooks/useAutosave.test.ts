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
    const state: GameState = {
      currency: 50,
      businesses: { bayas: { level: 1, cycleElapsedMs: null } },
    }
    renderHook(() => useAutosave(state))

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    vi.advanceTimersByTime(10_000)

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string).state).toEqual(state)
  })

  it('guarda inmediatamente al ocultar la pestaña', () => {
    const state: GameState = {
      currency: 7,
      businesses: { bayas: { level: 2, cycleElapsedMs: 400 } },
    }
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

  it('guarda en pagehide como cinturón de seguridad al cerrar (bug 5 del GDD §10)', () => {
    const state: GameState = {
      currency: 11,
      businesses: { bayas: { level: 3, cycleElapsedMs: null } },
    }
    renderHook(() => useAutosave(state))

    window.dispatchEvent(new Event('pagehide'))

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string).state).toEqual(state)
  })
})
