import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGameLoop } from './useGameLoop'
import type { GameState } from '../../core/types'

describe('useGameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('un ciclo lanzado avanza y cobra al completarse (bayas nivel 1 = 1 Sustento tras 2s)', () => {
    const initial: GameState = {
      currency: 0,
      businesses: { bayas: { level: 1, cycleElapsedMs: 0 } },
    }
    const { result } = renderHook(() => useGameLoop(initial))

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    const [state] = result.current
    expect(state.currency).toBe(1)
    expect(state.businesses.bayas.cycleElapsedMs).toBeNull()
  })

  it('en reposo (sin tap) no produce nada aunque pase el tiempo', () => {
    const initial: GameState = {
      currency: 0,
      businesses: { bayas: { level: 1, cycleElapsedMs: null } },
    }
    const { result } = renderHook(() => useGameLoop(initial))

    act(() => {
      vi.advanceTimersByTime(10_000)
    })

    expect(result.current[0].currency).toBe(0)
  })
})
