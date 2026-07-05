import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGameLoop } from './useGameLoop'

describe('useGameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('avanza el estado con el paso del tiempo (bayas nivel 1 = 1 cada 2s)', () => {
    const { result } = renderHook(() => useGameLoop({ currency: 0, businesses: { bayas: 1 } }))

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    const [state] = result.current
    expect(state.currency).toBeCloseTo(1)
  })

  it('no avanza si no pasa tiempo', () => {
    const { result } = renderHook(() => useGameLoop({ currency: 0, businesses: { bayas: 1 } }))

    const [state] = result.current
    expect(state.currency).toBe(0)
  })
})
