import { describe, expect, it } from 'vitest'
import { MAX_TICK_DELTA_MS, tick } from './tick'
import type { BusinessDefinition, GameState } from './types'

const CATALOG: BusinessDefinition[] = [
  { id: 'a', name: 'Negocio A', baseCost: 10, costGrowth: 2, cycleMs: 1000, baseOutputPerCycle: 1 },
  { id: 'b', name: 'Negocio B', baseCost: 100, costGrowth: 1.5, cycleMs: 4000, baseOutputPerCycle: 5 },
]

describe('tick (ciclos activados por tap, R1)', () => {
  it('delta=0 no modifica el estado', () => {
    const state: GameState = {
      currency: 10,
      businesses: { a: { level: 1, cycleElapsedMs: 500 } },
    }

    expect(tick(state, 0, CATALOG)).toBe(state)
  })

  it('un negocio en reposo NO produce nada, pase el tiempo que pase (sin automatización hasta R4)', () => {
    const state: GameState = {
      currency: 10,
      businesses: { a: { level: 5, cycleElapsedMs: null } },
    }

    const result = tick(state, 60_000, CATALOG)

    expect(result.currency).toBe(10)
    expect(result.businesses.a.cycleElapsedMs).toBeNull()
  })

  it('un ciclo en curso avanza sin cobrar hasta completarse', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { level: 1, cycleElapsedMs: 0 } },
    }

    const result = tick(state, 400, CATALOG)

    expect(result.currency).toBe(0)
    expect(result.businesses.a.cycleElapsedMs).toBe(400)
  })

  it('al completarse el ciclo cobra la producción del nivel y vuelve a reposo (no se relanza solo)', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { level: 3, cycleElapsedMs: 800 } },
    }

    const result = tick(state, 200, CATALOG)

    expect(result.currency).toBe(3)
    expect(result.businesses.a.cycleElapsedMs).toBeNull()
  })

  it('el cobro aplica los hitos de producción (nivel 10 → ×2)', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { level: 10, cycleElapsedMs: 999 } },
    }

    const result = tick(state, 1, CATALOG)

    expect(result.currency).toBe(20)
  })

  it('el ciclo respeta la duración reducida por hitos de velocidad (nivel 25 → 500ms)', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { level: 25, cycleElapsedMs: 0 } },
    }

    const result = tick(state, 500, CATALOG)

    expect(result.currency).toBeGreaterThan(0)
    expect(result.businesses.a.cycleElapsedMs).toBeNull()
  })

  it('cada negocio lleva su ciclo de forma independiente', () => {
    const state: GameState = {
      currency: 0,
      businesses: {
        a: { level: 1, cycleElapsedMs: 900 },
        b: { level: 2, cycleElapsedMs: 1000 },
      },
    }

    const result = tick(state, 200, CATALOG)

    // a completa (1000ms) y cobra 1; b sigue en curso (1200/4000)
    expect(result.currency).toBe(1)
    expect(result.businesses.a.cycleElapsedMs).toBeNull()
    expect(result.businesses.b.cycleElapsedMs).toBe(1200)
  })

  it('delta negativo (reloj hacia atrás) no avanza ni cobra', () => {
    const state: GameState = {
      currency: 10,
      businesses: { a: { level: 1, cycleElapsedMs: 500 } },
    }

    expect(tick(state, -5000, CATALOG)).toBe(state)
  })

  it('el delta se capa al máximo por tick: lo que pase de ahí es asunto del flujo offline (R2)', () => {
    const state: GameState = {
      currency: 0,
      businesses: { b: { level: 1, cycleElapsedMs: 0 } },
    }

    const result = tick(state, MAX_TICK_DELTA_MS * 10, CATALOG)

    // el ciclo de b (4000ms) completa una sola vez: se cobra 5, no 5 × N ciclos
    expect(result.currency).toBe(5)
    expect(result.businesses.b.cycleElapsedMs).toBeNull()
  })

  it('ignora ids del estado que no existen en el catálogo (saves con negocios retirados)', () => {
    const state: GameState = {
      currency: 0,
      businesses: { fantasma: { level: 99, cycleElapsedMs: 0 } },
    }

    const result = tick(state, 60_000, CATALOG)

    expect(result.currency).toBe(0)
  })
})
