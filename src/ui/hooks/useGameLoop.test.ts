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

  it('un hueco >60s (pestaña suspendida) se liquida por el flujo offline y notifica el resumen', () => {
    const onLongGap = vi.fn()
    const initial: GameState = {
      currency: 0,
      businesses: { bayas: { level: 2, cycleElapsedMs: 500 } },
    }
    const { result } = renderHook(() => useGameLoop(initial, onLongGap))

    act(() => {
      vi.setSystemTime(Date.now() + 2 * 60 * 60 * 1000)
      vi.advanceTimersByTime(100)
    })

    const [state] = result.current
    expect(state.currency).toBe(2)
    expect(state.businesses.bayas.cycleElapsedMs).toBeNull()
    expect(onLongGap).toHaveBeenCalledOnce()
    expect(onLongGap.mock.calls[0][0].earned).toBe(2)
  })

  it('un hueco >60s sin cobro (nada lanzado) no notifica: el modal solo aparece con ganancias', () => {
    const onLongGap = vi.fn()
    const initial: GameState = {
      currency: 7,
      businesses: { bayas: { level: 2, cycleElapsedMs: null } },
    }
    const { result } = renderHook(() => useGameLoop(initial, onLongGap))

    act(() => {
      vi.setSystemTime(Date.now() + 2 * 60 * 60 * 1000)
      vi.advanceTimersByTime(100)
    })

    expect(result.current[0].currency).toBe(7)
    expect(onLongGap).not.toHaveBeenCalled()
  })
})
