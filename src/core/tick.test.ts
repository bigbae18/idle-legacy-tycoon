import { describe, expect, it } from 'vitest'
import { MAX_TICK_DELTA_MS, tick } from './tick'
import type { BusinessDefinition, GameState } from './types'

const CATALOG: BusinessDefinition[] = [
  { id: 'a', name: 'Negocio A', baseCost: 10, costGrowth: 2, cycleMs: 1000, baseOutputPerCycle: 1 },
]

// Un nivel de 'a' produce 1 por segundo (1/1000 por ms).
const STATE: GameState = { currency: 10, businesses: { a: 1 } }

describe('tick', () => {
  it('delta=0 no modifica el estado', () => {
    const result = tick(STATE, 0, CATALOG)

    expect(result.currency).toBe(10)
  })

  it('delta=N produce N×producción', () => {
    const result = tick(STATE, 5000, CATALOG)

    expect(result.currency).toBe(15)
  })

  it('sin negocios comprados no produce nada, sea cual sea el delta', () => {
    const result = tick({ currency: 10, businesses: {} }, 60_000, CATALOG)

    expect(result.currency).toBe(10)
  })

  it('delta negativo (reloj hacia atrás) no produce ni resta', () => {
    const result = tick(STATE, -5000, CATALOG)

    expect(result.currency).toBe(10)
  })

  it('el delta se capa al máximo por tick: lo que pase de ahí es asunto del flujo offline', () => {
    const result = tick(STATE, MAX_TICK_DELTA_MS * 10, CATALOG)

    expect(result.currency).toBe(10 + MAX_TICK_DELTA_MS / 1000)
  })
})
