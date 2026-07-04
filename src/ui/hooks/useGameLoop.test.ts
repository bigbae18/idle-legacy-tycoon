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

  it('avanza el estado con el paso del tiempo', () => {
    const { result } = renderHook(() => useGameLoop({ amount: 0, rate: 1 }))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    const [state] = result.current
    expect(state.amount).toBe(1000)
  })

  it('no avanza si no pasa tiempo', () => {
    const { result } = renderHook(() => useGameLoop({ amount: 0, rate: 1 }))

    const [state] = result.current
    expect(state.amount).toBe(0)
  })
})
