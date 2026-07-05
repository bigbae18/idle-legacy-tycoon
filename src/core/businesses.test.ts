import { describe, expect, it } from 'vitest'
import {
  businessCount,
  bulkCost,
  createInitialState,
  cycleDurationMs,
  maxAffordable,
  outputPerCycle,
  purchaseUnits,
  startCycle,
  unitCost,
} from './businesses'
import type { BusinessDefinition, GameState } from './types'

/**
 * Catálogo fixture en cadena (R2.5): 'a' produce la moneda; 'b' produce unidades
 * de 'a'; 'c' produce unidades de 'b'. Números redondos para tests legibles.
 */
const CATALOG: BusinessDefinition[] = [
  { id: 'a', name: 'Negocio A', baseCost: 10, costGrowth: 2, cycleMs: 1000, baseOutputPerCycle: 1 },
  { id: 'b', name: 'Negocio B', baseCost: 100, costGrowth: 1.5, cycleMs: 4000, baseOutputPerCycle: 2 },
  { id: 'c', name: 'Negocio C', baseCost: 1000, costGrowth: 2, cycleMs: 8000, baseOutputPerCycle: 1 },
]

function stateWith(currency: number, counts: Record<string, number>): GameState {
  const businesses: GameState['businesses'] = {}
  for (const [id, count] of Object.entries(counts)) {
    businesses[id] = { count, purchased: count, cycleElapsedMs: null }
  }
  return { currency, businesses }
}

describe('createInitialState', () => {
  it('el primer negocio de la cadena empieza con 1 unidad (gratis) y el resto a 0, todos en reposo', () => {
    const state = createInitialState(CATALOG)

    expect(state.currency).toBe(0)
    expect(state.businesses).toEqual({
      a: { count: 1, purchased: 1, cycleElapsedMs: null },
      b: { count: 0, purchased: 0, cycleElapsedMs: null },
      c: { count: 0, purchased: 0, cycleElapsedMs: null },
    })
  })
})

describe('businessCount', () => {
  it('devuelve 0 para un negocio que no está en el estado', () => {
    const state: GameState = { currency: 0, businesses: {} }

    expect(businessCount(state, 'a')).toBe(0)
  })

  it('devuelve las unidades totales del negocio', () => {
    expect(businessCount(stateWith(0, { a: 7 }), 'a')).toBe(7)
  })
})

describe('unitCost', () => {
  it('coste(n) = base × crecimiento^compradas, redondeado hacia arriba', () => {
    const [a] = CATALOG

    expect(unitCost(a, 0)).toBe(10)
    expect(unitCost(a, 1)).toBe(20)
    expect(unitCost(a, 2)).toBe(40)
  })
})

describe('outputPerCycle', () => {
  it('escala linealmente con las unidades totales', () => {
    const [a] = CATALOG

    expect(outputPerCycle(a, 0)).toBe(0)
    expect(outputPerCycle(a, 1)).toBe(1)
    expect(outputPerCycle(a, 5)).toBe(5)
  })

  it('aplica los hitos de producción alcanzados (10 unidades → ×2, GDD §3)', () => {
    const [a] = CATALOG

    expect(outputPerCycle(a, 9)).toBe(9)
    expect(outputPerCycle(a, 10)).toBe(20)
  })
})

describe('cycleDurationMs', () => {
  it('sin hitos de velocidad, la duración es la base del catálogo', () => {
    const [a] = CATALOG

    expect(cycleDurationMs(a, 1)).toBe(1000)
    expect(cycleDurationMs(a, 10)).toBe(1000)
  })

  it('los hitos de velocidad reducen la duración (25 unidades → ciclo a la mitad, GDD §3)', () => {
    const [a] = CATALOG

    expect(cycleDurationMs(a, 25)).toBe(500)
  })
})

describe('bulkCost', () => {
  it('con count=1 equivale al coste de la siguiente unidad', () => {
    const [a] = CATALOG

    expect(bulkCost(a, 3, 1)).toBe(unitCost(a, 3))
  })

  it('suma el coste de cada unidad del tramo', () => {
    const [a] = CATALOG

    // compradas 0→3: 10 + 20 + 40 = 70
    expect(bulkCost(a, 0, 3)).toBe(70)
  })
})

describe('maxAffordable', () => {
  it('sin fondos para ni una unidad devuelve 0', () => {
    const [a] = CATALOG

    expect(maxAffordable(a, 0, 9)).toBe(0)
  })

  it('devuelve cuántas unidades seguidas alcanzan los fondos', () => {
    const [a] = CATALOG

    expect(maxAffordable(a, 0, 70)).toBe(3)
    expect(maxAffordable(a, 0, 149)).toBe(3)
    expect(maxAffordable(a, 0, 150)).toBe(4)
  })
})

describe('purchaseUnits', () => {
  it('sin fondos para el lote completo no compra nada (todo o nada)', () => {
    const state = stateWith(69, { a: 0 })

    const result = purchaseUnits(state, CATALOG[0], 3)

    expect(result).toEqual(state)
  })

  it('con fondos descuenta el coste total y suma el lote a count y purchased', () => {
    const state = stateWith(75, { a: 0 })

    const result = purchaseUnits(state, CATALOG[0], 3)

    expect(result.currency).toBe(5)
    expect(result.businesses.a.count).toBe(3)
    expect(result.businesses.a.purchased).toBe(3)
  })

  it('el precio escala con lo COMPRADO, no con lo producido (regla clave de la cascada, R2.5)', () => {
    // 50 unidades totales pero solo 2 compradas: la 3ª compra cuesta base × growth² = 40
    const state: GameState = {
      currency: 40,
      businesses: { a: { count: 50, purchased: 2, cycleElapsedMs: null } },
    }

    const result = purchaseUnits(state, CATALOG[0], 1)

    expect(result.currency).toBe(0)
    expect(result.businesses.a.count).toBe(51)
    expect(result.businesses.a.purchased).toBe(3)
  })

  it('comprar la primera unidad de un negocio bloqueado (0 unidades) lo desbloquea', () => {
    const state: GameState = { currency: 100, businesses: {} }

    const result = purchaseUnits(state, CATALOG[1], 1)

    expect(result.currency).toBe(0)
    expect(result.businesses.b).toEqual({ count: 1, purchased: 1, cycleElapsedMs: null })
  })

  it('count < 1 no hace nada', () => {
    const state = stateWith(100, { a: 1 })

    expect(purchaseUnits(state, CATALOG[0], 0)).toEqual(state)
  })

  it('comprar no toca el ciclo en curso del negocio', () => {
    const state: GameState = {
      currency: 100,
      businesses: { a: { count: 1, purchased: 1, cycleElapsedMs: 400 } },
    }

    const result = purchaseUnits(state, CATALOG[0], 1)

    expect(result.businesses.a.cycleElapsedMs).toBe(400)
  })

  it('no muta el estado original', () => {
    const state = stateWith(75, { a: 1 })

    purchaseUnits(state, CATALOG[0], 1)

    expect(state.currency).toBe(75)
    expect(state.businesses.a.count).toBe(1)
  })
})

describe('startCycle', () => {
  it('el tap lanza el ciclo de un negocio en reposo con unidades', () => {
    const state = stateWith(0, { a: 1 })

    const result = startCycle(state, 'a')

    expect(result.businesses.a.cycleElapsedMs).toBe(0)
  })

  it('no lanza nada si el negocio ya tiene un ciclo en curso', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { count: 1, purchased: 1, cycleElapsedMs: 300 } },
    }

    expect(startCycle(state, 'a')).toBe(state)
  })

  it('no lanza nada si el negocio está a 0 unidades o no existe en el estado', () => {
    const state = stateWith(0, { a: 0 })

    expect(startCycle(state, 'a')).toBe(state)
    expect(startCycle(state, 'fantasma')).toBe(state)
  })
})
