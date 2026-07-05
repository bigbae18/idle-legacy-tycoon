import { describe, expect, it } from 'vitest'
import { nextMilestone, productionMultiplier, speedMultiplier } from './milestones'
import { MILESTONES } from './data/milestones'
import type { MilestoneDefinition } from './types'

/** Fixture propio para que los tests no dependan de los números tuneables del catálogo real. */
const FIXTURE: MilestoneDefinition[] = [
  { count: 10, effect: 'production', multiplier: 2 },
  { count: 25, effect: 'speed', multiplier: 2 },
  { count: 50, effect: 'production', multiplier: 3 },
]

describe('productionMultiplier', () => {
  it('por debajo del primer hito no multiplica', () => {
    expect(productionMultiplier(9, FIXTURE)).toBe(1)
  })

  it('acumula solo los hitos de producción alcanzados', () => {
    expect(productionMultiplier(10, FIXTURE)).toBe(2)
    expect(productionMultiplier(25, FIXTURE)).toBe(2)
    expect(productionMultiplier(50, FIXTURE)).toBe(6)
  })
})

describe('speedMultiplier', () => {
  it('acumula solo los hitos de velocidad alcanzados', () => {
    expect(speedMultiplier(9, FIXTURE)).toBe(1)
    expect(speedMultiplier(10, FIXTURE)).toBe(1)
    expect(speedMultiplier(25, FIXTURE)).toBe(2)
    expect(speedMultiplier(200, FIXTURE)).toBe(2)
  })
})

describe('nextMilestone', () => {
  it('devuelve el primer hito aún no alcanzado', () => {
    expect(nextMilestone(0, FIXTURE)?.count).toBe(10)
    expect(nextMilestone(9, FIXTURE)?.count).toBe(10)
    expect(nextMilestone(10, FIXTURE)?.count).toBe(25)
  })

  it('devuelve null cuando todos los hitos están conseguidos', () => {
    expect(nextMilestone(50, FIXTURE)).toBeNull()
  })
})

describe('catálogo real de hitos (GDD §3, tabla duplicante para la cascada R2.5)', () => {
  it('arranca en 10/25/50/100/200 y sigue duplicando (las unidades producidas inflan los conteos)', () => {
    expect(MILESTONES.slice(0, 5).map((m) => m.count)).toEqual([10, 25, 50, 100, 200])
    expect(MILESTONES.length).toBeGreaterThanOrEqual(15)
    expect(MILESTONES.at(-1)!.count).toBeGreaterThanOrEqual(100_000)
  })

  it('los umbrales crecen estrictamente', () => {
    for (let i = 1; i < MILESTONES.length; i++) {
      expect(MILESTONES[i].count).toBeGreaterThan(MILESTONES[i - 1].count)
    }
  })

  it('mezcla producción y velocidad, pero la velocidad está acotada (el ciclo no puede tender a 0)', () => {
    const speed = MILESTONES.filter((m) => m.effect === 'speed')
    const production = MILESTONES.filter((m) => m.effect === 'production')

    expect(production.length).toBeGreaterThan(0)
    expect(speed.length).toBeGreaterThan(0)
    expect(speed.length).toBeLessThanOrEqual(3)
  })

  it('todos los multiplicadores son > 1', () => {
    for (const milestone of MILESTONES) {
      expect(milestone.multiplier).toBeGreaterThan(1)
    }
  })
})
