import { describe, expect, it } from 'vitest'
import {
  businessLevel,
  bulkCost,
  createInitialState,
  cycleDurationMs,
  levelCost,
  maxAffordable,
  outputPerCycle,
  purchaseLevels,
  startCycle,
} from './businesses'
import type { BusinessDefinition, GameState } from './types'

/** Catálogo fixture con números redondos para que la aritmética de los tests sea legible. */
const CATALOG: BusinessDefinition[] = [
  { id: 'a', name: 'Negocio A', baseCost: 10, costGrowth: 2, cycleMs: 1000, baseOutputPerCycle: 1 },
  { id: 'b', name: 'Negocio B', baseCost: 100, costGrowth: 1.5, cycleMs: 500, baseOutputPerCycle: 5 },
]

function stateWith(currency: number, levels: Record<string, number>): GameState {
  const businesses: GameState['businesses'] = {}
  for (const [id, level] of Object.entries(levels)) {
    businesses[id] = { level, cycleElapsedMs: null }
  }
  return { currency, businesses }
}

describe('createInitialState', () => {
  it('el primer negocio del catálogo empieza a nivel 1 (gratis) y el resto a 0, todos en reposo', () => {
    const state = createInitialState(CATALOG)

    expect(state.currency).toBe(0)
    expect(state.businesses).toEqual({
      a: { level: 1, cycleElapsedMs: null },
      b: { level: 0, cycleElapsedMs: null },
    })
  })
})

describe('businessLevel', () => {
  it('devuelve 0 para un negocio que no está en el estado', () => {
    const state: GameState = { currency: 0, businesses: {} }

    expect(businessLevel(state, 'a')).toBe(0)
  })

  it('devuelve el nivel del negocio', () => {
    expect(businessLevel(stateWith(0, { a: 7 }), 'a')).toBe(7)
  })
})

describe('levelCost', () => {
  it('coste(n) = base × crecimiento^n, redondeado hacia arriba', () => {
    const [a] = CATALOG

    expect(levelCost(a, 0)).toBe(10)
    expect(levelCost(a, 1)).toBe(20)
    expect(levelCost(a, 2)).toBe(40)
  })
})

describe('outputPerCycle', () => {
  it('escala linealmente con el nivel', () => {
    const [a] = CATALOG

    expect(outputPerCycle(a, 0)).toBe(0)
    expect(outputPerCycle(a, 1)).toBe(1)
    expect(outputPerCycle(a, 5)).toBe(5)
  })

  it('aplica los hitos de producción alcanzados (nivel 10 → ×2, GDD §3)', () => {
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

  it('los hitos de velocidad reducen la duración (nivel 25 → ciclo a la mitad, GDD §3)', () => {
    const [a] = CATALOG

    expect(cycleDurationMs(a, 25)).toBe(500)
  })
})

describe('bulkCost', () => {
  it('con count=1 equivale al coste del siguiente nivel', () => {
    const [a] = CATALOG

    expect(bulkCost(a, 3, 1)).toBe(levelCost(a, 3))
  })

  it('suma el coste de cada nivel del tramo', () => {
    const [a] = CATALOG

    // niveles 0→3: 10 + 20 + 40 = 70
    expect(bulkCost(a, 0, 3)).toBe(70)
  })
})

describe('maxAffordable', () => {
  it('sin fondos para ni un nivel devuelve 0', () => {
    const [a] = CATALOG

    expect(maxAffordable(a, 0, 9)).toBe(0)
  })

  it('devuelve cuántos niveles seguidos alcanzan los fondos', () => {
    const [a] = CATALOG

    // 10 + 20 + 40 = 70 alcanza; +80 ya no
    expect(maxAffordable(a, 0, 70)).toBe(3)
    expect(maxAffordable(a, 0, 149)).toBe(3)
    expect(maxAffordable(a, 0, 150)).toBe(4)
  })
})

describe('purchaseLevels', () => {
  it('sin fondos para el lote completo no compra nada (todo o nada)', () => {
    const state = stateWith(69, { a: 0 })

    const result = purchaseLevels(state, CATALOG[0], 3)

    expect(result).toEqual(state)
  })

  it('con fondos descuenta el coste total y sube todos los niveles del lote', () => {
    const state = stateWith(75, { a: 0 })

    const result = purchaseLevels(state, CATALOG[0], 3)

    expect(result.currency).toBe(5)
    expect(result.businesses.a.level).toBe(3)
  })

  it('comprar el primer nivel de un negocio bloqueado (nivel 0) lo desbloquea', () => {
    const state: GameState = { currency: 100, businesses: {} }

    const result = purchaseLevels(state, CATALOG[1], 1)

    expect(result.currency).toBe(0)
    expect(result.businesses.b).toEqual({ level: 1, cycleElapsedMs: null })
  })

  it('count < 1 no hace nada', () => {
    const state = stateWith(100, { a: 1 })

    expect(purchaseLevels(state, CATALOG[0], 0)).toEqual(state)
  })

  it('comprar no toca el ciclo en curso del negocio', () => {
    const state: GameState = {
      currency: 100,
      businesses: { a: { level: 1, cycleElapsedMs: 400 } },
    }

    const result = purchaseLevels(state, CATALOG[0], 1)

    expect(result.businesses.a.cycleElapsedMs).toBe(400)
  })

  it('no muta el estado original', () => {
    const state = stateWith(75, { a: 1 })

    purchaseLevels(state, CATALOG[0], 1)

    expect(state.currency).toBe(75)
    expect(state.businesses.a.level).toBe(1)
  })
})

describe('startCycle', () => {
  it('el tap lanza el ciclo de un negocio en reposo', () => {
    const state = stateWith(0, { a: 1 })

    const result = startCycle(state, 'a')

    expect(result.businesses.a.cycleElapsedMs).toBe(0)
  })

  it('no lanza nada si el negocio ya tiene un ciclo en curso', () => {
    const state: GameState = {
      currency: 0,
      businesses: { a: { level: 1, cycleElapsedMs: 300 } },
    }

    const result = startCycle(state, 'a')

    expect(result).toBe(state)
  })

  it('no lanza nada si el negocio está a nivel 0 o no existe en el estado', () => {
    const state = stateWith(0, { a: 0 })

    expect(startCycle(state, 'a')).toBe(state)
    expect(startCycle(state, 'fantasma')).toBe(state)
  })

  it('no muta el estado original', () => {
    const state = stateWith(0, { a: 1 })

    startCycle(state, 'a')

    expect(state.businesses.a.cycleElapsedMs).toBeNull()
  })
})
