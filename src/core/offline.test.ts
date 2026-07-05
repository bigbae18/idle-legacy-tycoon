import { describe, expect, it } from 'vitest'
import { OFFLINE_CAP_MS } from './data/offline'
import { settleOffline } from './offline'
import type { BusinessDefinition, GameState } from './types'

const CATALOG: BusinessDefinition[] = [
  { id: 'a', name: 'Negocio A', baseCost: 10, costGrowth: 2, cycleMs: 1000, baseOutputPerCycle: 1 },
  { id: 'b', name: 'Negocio B', baseCost: 100, costGrowth: 1.5, cycleMs: 4000, baseOutputPerCycle: 5 },
]

const SAVED_AT = 1_751_800_000_000

describe('settleOffline', () => {
  it('delta negativo (reloj hacia atrás) → sin cobro, sin tiempo reconocido, estado intacto', () => {
    const state: GameState = {
      currency: 10,
      businesses: { a: { level: 1, cycleElapsedMs: 500 } },
    }

    const result = settleOffline(state, SAVED_AT, SAVED_AT - 5000, CATALOG)

    expect(result.elapsedMs).toBe(0)
    expect(result.earned).toBe(0)
    expect(result.state).toBe(state)
  })

  it('delta 0 → no-op', () => {
    const state: GameState = { currency: 10, businesses: {} }

    const result = settleOffline(state, SAVED_AT, SAVED_AT, CATALOG)

    expect(result.elapsedMs).toBe(0)
    expect(result.state).toBe(state)
  })

  it('sin ciclos lanzados no hay cobro, pero el tiempo fuera sí se reporta', () => {
    const state: GameState = {
      currency: 10,
      businesses: { a: { level: 5, cycleElapsedMs: null } },
    }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 7_200_000, CATALOG)

    expect(result.elapsedMs).toBe(7_200_000)
    expect(result.earned).toBe(0)
    expect(result.state).toBe(state)
  })

  it('un ciclo lanzado completa mientras no estabas: cobra la producción del nivel y queda en reposo', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { level: 3, cycleElapsedMs: 800 } },
    }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 600_000, CATALOG)

    expect(result.earned).toBe(3)
    expect(result.state.currency).toBe(3)
    expect(result.state.businesses.a.cycleElapsedMs).toBeNull()
  })

  it('no se relanza solo: un delta enorme cobra exactamente UN ciclo (la automatización llega en R4)', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { level: 1, cycleElapsedMs: 0 } },
    }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + OFFLINE_CAP_MS, CATALOG)

    expect(result.earned).toBe(1)
  })

  it('un ciclo que no llega a completar avanza su progreso con el tiempo fuera', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { level: 1, cycleElapsedMs: 500 } },
    }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 100, CATALOG)

    expect(result.earned).toBe(0)
    expect(result.state.businesses.a.cycleElapsedMs).toBe(600)
  })

  it('el cobro aplica los hitos de producción (nivel 10 → ×2)', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { level: 10, cycleElapsedMs: 0 } },
    }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 5000, CATALOG)

    expect(result.earned).toBe(20)
  })

  it('cada negocio lleva su ciclo de forma independiente', () => {
    const state: GameState = {
      currency: 0,
      businesses: {
        a: { level: 1, cycleElapsedMs: 900 },
        b: { level: 2, cycleElapsedMs: 1000 },
      },
    }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 200, CATALOG)

    expect(result.earned).toBe(1)
    expect(result.state.businesses.a.cycleElapsedMs).toBeNull()
    expect(result.state.businesses.b.cycleElapsedMs).toBe(1200)
  })

  it('el tiempo fuera se capa al tope (8h por defecto, desde datos)', () => {
    expect(OFFLINE_CAP_MS).toBe(8 * 60 * 60 * 1000)

    const state: GameState = { currency: 0, businesses: {} }
    const result = settleOffline(state, SAVED_AT, SAVED_AT + 24 * 60 * 60 * 1000, CATALOG)

    expect(result.elapsedMs).toBe(OFFLINE_CAP_MS)
  })

  it('el avance de ciclos usa el tiempo capado, no el delta real (tope inyectable para el árbol del Legado)', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { level: 1, cycleElapsedMs: 500 } },
    }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 600_000, CATALOG, 200)

    expect(result.elapsedMs).toBe(200)
    expect(result.earned).toBe(0)
    expect(result.state.businesses.a.cycleElapsedMs).toBe(700)
  })

  it('ignora ids del estado que no existen en el catálogo', () => {
    const state: GameState = {
      currency: 0,
      businesses: { fantasma: { level: 99, cycleElapsedMs: 0 } },
    }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 600_000, CATALOG)

    expect(result.earned).toBe(0)
  })

  it('no muta el estado original', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { level: 3, cycleElapsedMs: 800 } },
    }

    settleOffline(state, SAVED_AT, SAVED_AT + 600_000, CATALOG)

    expect(state.currency).toBe(0)
    expect(state.businesses.a.cycleElapsedMs).toBe(800)
  })
})
