import { describe, expect, it } from 'vitest'
import { PREHISTORIA } from './prehistoria'

/**
 * Invariantes del catálogo (GDD §3), no valores exactos: los números concretos
 * se tunean en la fase de balance (R8) sin que estos tests se rompan.
 */
describe('catálogo de la Prehistoria', () => {
  it('tiene 5 negocios con ids únicos', () => {
    expect(PREHISTORIA).toHaveLength(5)
    const ids = PREHISTORIA.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('los costes base crecen estrictamente de un negocio al siguiente', () => {
    for (let i = 1; i < PREHISTORIA.length; i++) {
      expect(PREHISTORIA[i].baseCost).toBeGreaterThan(PREHISTORIA[i - 1].baseCost)
    }
  })

  it('todos los negocios tienen crecimiento de coste > 1 y ciclo/producción positivos', () => {
    for (const business of PREHISTORIA) {
      expect(business.costGrowth).toBeGreaterThan(1)
      expect(business.cycleMs).toBeGreaterThan(0)
      expect(business.baseOutputPerCycle).toBeGreaterThan(0)
    }
  })
})
