import { describe, expect, it } from 'vitest'
import {
  businessLevel,
  createInitialState,
  levelCost,
  productionPerMs,
  purchaseLevel,
} from './businesses'
import type { BusinessDefinition, GameState } from './types'

/** Catálogo fixture con números redondos para que la aritmética de los tests sea legible. */
const CATALOG: BusinessDefinition[] = [
  { id: 'a', name: 'Negocio A', baseCost: 10, costGrowth: 2, cycleMs: 1000, baseOutputPerCycle: 1 },
  { id: 'b', name: 'Negocio B', baseCost: 100, costGrowth: 1.5, cycleMs: 500, baseOutputPerCycle: 5 },
]

describe('createInitialState', () => {
  it('el primer negocio del catálogo empieza a nivel 1 (gratis) y el resto a 0', () => {
    const state = createInitialState(CATALOG)

    expect(state.currency).toBe(0)
    expect(state.businesses).toEqual({ a: 1, b: 0 })
  })
})

describe('businessLevel', () => {
  it('devuelve 0 para un negocio que no está en el estado', () => {
    const state: GameState = { currency: 0, businesses: {} }

    expect(businessLevel(state, 'a')).toBe(0)
  })
})

describe('levelCost', () => {
  it('coste(n) = base × crecimiento^n, redondeado hacia arriba', () => {
    const [a] = CATALOG

    expect(levelCost(a, 0)).toBe(10)
    expect(levelCost(a, 1)).toBe(20)
    expect(levelCost(a, 2)).toBe(40)
  })

  it('cada nivel es más caro que el anterior', () => {
    const [, b] = CATALOG

    expect(levelCost(b, 1)).toBeGreaterThan(levelCost(b, 0))
    expect(levelCost(b, 2)).toBeGreaterThan(levelCost(b, 1))
  })
})

describe('purchaseLevel', () => {
  it('sin fondos suficientes no hace nada', () => {
    const state: GameState = { currency: 9, businesses: { a: 0 } }

    const result = purchaseLevel(state, CATALOG[0])

    expect(result).toEqual(state)
  })

  it('con fondos suficientes descuenta el coste y sube un nivel', () => {
    const state: GameState = { currency: 25, businesses: { a: 1 } }

    const result = purchaseLevel(state, CATALOG[0])

    expect(result.currency).toBe(5)
    expect(result.businesses.a).toBe(2)
  })

  it('comprar el primer nivel de un negocio bloqueado (nivel 0) lo desbloquea', () => {
    const state: GameState = { currency: 100, businesses: {} }

    const result = purchaseLevel(state, CATALOG[1])

    expect(result.currency).toBe(0)
    expect(result.businesses.b).toBe(1)
  })

  it('no muta el estado original', () => {
    const state: GameState = { currency: 25, businesses: { a: 1 } }

    purchaseLevel(state, CATALOG[0])

    expect(state.currency).toBe(25)
    expect(state.businesses.a).toBe(1)
  })
})

describe('productionPerMs', () => {
  it('sin niveles comprados, la producción es 0', () => {
    const state: GameState = { currency: 0, businesses: {} }

    expect(productionPerMs(state, CATALOG)).toBe(0)
  })

  it('suma la producción media de cada negocio: nivel × producción/ciclo ÷ duración', () => {
    const state: GameState = { currency: 0, businesses: { a: 2, b: 1 } }

    // a: 2 × 1/1000 = 0.002 · b: 1 × 5/500 = 0.01
    expect(productionPerMs(state, CATALOG)).toBeCloseTo(0.012)
  })

  it('ignora ids del estado que no existen en el catálogo (saves con negocios retirados)', () => {
    const state: GameState = { currency: 0, businesses: { fantasma: 99, a: 1 } }

    expect(productionPerMs(state, CATALOG)).toBeCloseTo(0.001)
  })
})
