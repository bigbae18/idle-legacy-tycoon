import { describe, expect, it } from 'vitest'
import { OFFLINE_CAP_MS } from './data/offline'
import { settleOffline } from './offline'
import type { BusinessDefinition, GameState } from './types'

/** Cadena: 'a' produce moneda; 'b' produce unidades de 'a'. */
const CATALOG: BusinessDefinition[] = [
  { id: 'a', name: 'Negocio A', baseCost: 10, costGrowth: 2, cycleMs: 1000, baseOutputPerCycle: 1 },
  { id: 'b', name: 'Negocio B', baseCost: 100, costGrowth: 1.5, cycleMs: 4000, baseOutputPerCycle: 2 },
]

const SAVED_AT = 1_751_800_000_000

function idle(count: number) {
  return { count, purchased: count, cycleElapsedMs: null }
}

function running(count: number, cycleElapsedMs: number) {
  return { count, purchased: count, cycleElapsedMs }
}

describe('settleOffline', () => {
  it('delta negativo (reloj hacia atrás) → sin cobro, sin tiempo reconocido, estado intacto', () => {
    const state: GameState = { currency: 10, businesses: { a: running(1, 500) } }

    const result = settleOffline(state, SAVED_AT, SAVED_AT - 5000, CATALOG)

    expect(result.elapsedMs).toBe(0)
    expect(result.earned).toBe(0)
    expect(result.state).toBe(state)
  })

  it('sin ciclos lanzados no hay cobro, pero el tiempo fuera sí se reporta', () => {
    const state: GameState = { currency: 10, businesses: { a: idle(5) } }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 7_200_000, CATALOG)

    expect(result.elapsedMs).toBe(7_200_000)
    expect(result.earned).toBe(0)
    expect(result.state).toBe(state)
  })

  it('un ciclo del primer eslabón completa fuera: cobra moneda una sola vez y queda en reposo', () => {
    const state: GameState = { currency: 0, businesses: { a: running(3, 800) } }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 600_000, CATALOG)

    expect(result.earned).toBe(3)
    expect(result.state.currency).toBe(3)
    expect(result.state.businesses.a.cycleElapsedMs).toBeNull()
  })

  it('un eslabón superior completa fuera: acredita unidades del anterior y earned NO las cuenta (el modal es solo moneda)', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: idle(1), b: running(3, 0) },
    }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 600_000, CATALOG)

    expect(result.earned).toBe(0)
    expect(result.state.businesses.a.count).toBe(7)
    expect(result.state.businesses.b.cycleElapsedMs).toBeNull()
  })

  it('un ciclo que no llega a completar avanza su progreso con el tiempo fuera', () => {
    const state: GameState = { currency: 0, businesses: { a: running(1, 500) } }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 100, CATALOG)

    expect(result.earned).toBe(0)
    expect(result.state.businesses.a.cycleElapsedMs).toBe(600)
  })

  it('el tiempo fuera se capa al tope (8h por defecto, desde datos)', () => {
    expect(OFFLINE_CAP_MS).toBe(8 * 60 * 60 * 1000)

    const state: GameState = { currency: 0, businesses: {} }
    const result = settleOffline(state, SAVED_AT, SAVED_AT + 24 * 60 * 60 * 1000, CATALOG)

    expect(result.elapsedMs).toBe(OFFLINE_CAP_MS)
  })

  it('el avance de ciclos usa el tiempo capado, no el delta real (tope inyectable para el árbol del Legado)', () => {
    const state: GameState = { currency: 0, businesses: { a: running(1, 500) } }

    const result = settleOffline(state, SAVED_AT, SAVED_AT + 600_000, CATALOG, 200)

    expect(result.elapsedMs).toBe(200)
    expect(result.earned).toBe(0)
    expect(result.state.businesses.a.cycleElapsedMs).toBe(700)
  })

  it('no muta el estado original', () => {
    const state: GameState = { currency: 0, businesses: { a: running(3, 800) } }

    settleOffline(state, SAVED_AT, SAVED_AT + 600_000, CATALOG)

    expect(state.currency).toBe(0)
    expect(state.businesses.a.cycleElapsedMs).toBe(800)
  })
})
