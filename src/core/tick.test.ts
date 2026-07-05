import { describe, expect, it } from 'vitest'
import { MAX_TICK_DELTA_MS, tick } from './tick'
import type { BusinessDefinition, GameState } from './types'

/** Cadena: 'a' produce moneda; 'b' produce unidades de 'a'; 'c' produce unidades de 'b'. */
const CATALOG: BusinessDefinition[] = [
  { id: 'a', name: 'Negocio A', baseCost: 10, costGrowth: 2, cycleMs: 1000, baseOutputPerCycle: 1 },
  { id: 'b', name: 'Negocio B', baseCost: 100, costGrowth: 1.5, cycleMs: 4000, baseOutputPerCycle: 2 },
  { id: 'c', name: 'Negocio C', baseCost: 1000, costGrowth: 2, cycleMs: 8000, baseOutputPerCycle: 1 },
]

function idle(count: number) {
  return { count, purchased: count, cycleElapsedMs: null }
}

function running(count: number, cycleElapsedMs: number) {
  return { count, purchased: count, cycleElapsedMs }
}

describe('tick (cadena de producción, R2.5)', () => {
  it('delta=0 no modifica el estado', () => {
    const state: GameState = { currency: 10, businesses: { a: running(1, 500) } }

    expect(tick(state, 0, CATALOG)).toBe(state)
  })

  it('un negocio en reposo NO produce nada, pase el tiempo que pase', () => {
    const state: GameState = { currency: 10, businesses: { a: idle(5) } }

    const result = tick(state, 60_000, CATALOG)

    expect(result.currency).toBe(10)
  })

  it('el primer negocio de la cadena produce la moneda al completar su ciclo', () => {
    const state: GameState = { currency: 0, businesses: { a: running(3, 800) } }

    const result = tick(state, 200, CATALOG)

    expect(result.currency).toBe(3)
    expect(result.businesses.a.cycleElapsedMs).toBeNull()
  })

  it('un negocio superior produce unidades del ANTERIOR, no moneda (cascada)', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: idle(1), b: running(3, 3800) },
    }

    const result = tick(state, 200, CATALOG)

    // b (3 uds × 2 por ciclo) completa → +6 unidades de a; la moneda no se toca
    expect(result.currency).toBe(0)
    expect(result.businesses.a.count).toBe(7)
    expect(result.businesses.a.purchased).toBe(1)
    expect(result.businesses.b.cycleElapsedMs).toBeNull()
  })

  it('las unidades producidas no tocan purchased (el precio no se encarece por producir)', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { count: 5, purchased: 2, cycleElapsedMs: null }, b: running(1, 4000) },
    }

    const result = tick(state, 100, CATALOG)

    expect(result.businesses.a.count).toBe(7)
    expect(result.businesses.a.purchased).toBe(2)
  })

  it('si dos eslabones completan en el mismo tick, cada uno cobra con sus unidades PRE-tick', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: running(2, 900), b: running(1, 3900) },
    }

    const result = tick(state, 200, CATALOG)

    // a paga 2 (sus unidades antes del tick); b añade +2 unidades de a después
    expect(result.currency).toBe(2)
    expect(result.businesses.a.count).toBe(4)
    expect(result.businesses.a.cycleElapsedMs).toBeNull()
    expect(result.businesses.b.cycleElapsedMs).toBeNull()
  })

  it('acreditar unidades a un negocio con ciclo en curso no altera su progreso', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: running(1, 100), b: running(1, 3900) },
    }

    const result = tick(state, 200, CATALOG)

    expect(result.businesses.a.count).toBe(3)
    expect(result.businesses.a.cycleElapsedMs).toBe(300)
  })

  it('el eslabón intermedio acredita al de abajo y el de abajo a la moneda, cada uno por su ciclo', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: idle(1), b: idle(4), c: running(2, 7900) },
    }

    const result = tick(state, 200, CATALOG)

    // c (2 uds × 1) completa → +2 unidades de b; a y la moneda intactos
    expect(result.businesses.b.count).toBe(6)
    expect(result.businesses.a.count).toBe(1)
    expect(result.currency).toBe(0)
  })

  it('el cobro aplica los hitos de producción (10 unidades → ×2)', () => {
    const state: GameState = { currency: 0, businesses: { a: running(10, 999) } }

    const result = tick(state, 1, CATALOG)

    expect(result.currency).toBe(20)
  })

  it('delta negativo (reloj hacia atrás) no avanza ni cobra', () => {
    const state: GameState = { currency: 10, businesses: { a: running(1, 500) } }

    expect(tick(state, -5000, CATALOG)).toBe(state)
  })

  it('el delta se capa al máximo por tick: un ciclo completa UNA vez (sin automatización hasta R4)', () => {
    const state: GameState = { currency: 0, businesses: { b: running(1, 0), a: idle(0) } }

    const result = tick(state, MAX_TICK_DELTA_MS * 10, CATALOG)

    expect(result.businesses.a.count).toBe(2)
    expect(result.businesses.b.cycleElapsedMs).toBeNull()
  })

  it('ignora ids del estado que no existen en el catálogo (saves con negocios retirados)', () => {
    const state: GameState = { currency: 0, businesses: { fantasma: running(99, 0) } }

    const result = tick(state, 60_000, CATALOG)

    expect(result.currency).toBe(0)
  })
})
