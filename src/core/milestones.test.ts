import { describe, expect, it } from 'vitest'
import { nextMilestone, productionMultiplier, speedMultiplier } from './milestones'
import { MILESTONES } from './data/milestones'
import type { MilestoneDefinition } from './types'

/** Fixture propio para que los tests no dependan de los números tuneables del catálogo real. */
const FIXTURE: MilestoneDefinition[] = [
  { level: 10, effect: 'production', multiplier: 2 },
  { level: 25, effect: 'speed', multiplier: 2 },
  { level: 50, effect: 'production', multiplier: 3 },
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
    expect(nextMilestone(0, FIXTURE)?.level).toBe(10)
    expect(nextMilestone(9, FIXTURE)?.level).toBe(10)
    expect(nextMilestone(10, FIXTURE)?.level).toBe(25)
  })

  it('devuelve null cuando todos los hitos están conseguidos', () => {
    expect(nextMilestone(50, FIXTURE)).toBeNull()
  })
})

describe('catálogo real de hitos (GDD §3)', () => {
  it('los niveles son 10/25/50/100/200, en orden ascendente', () => {
    expect(MILESTONES.map((m) => m.level)).toEqual([10, 25, 50, 100, 200])
  })

  it('mezcla hitos de producción y de velocidad (refinamiento 2026-07-05: los niveles mejoran cantidad y tiempo)', () => {
    const effects = new Set(MILESTONES.map((m) => m.effect))
    expect(effects).toContain('production')
    expect(effects).toContain('speed')
  })

  it('todos los multiplicadores son > 1', () => {
    for (const milestone of MILESTONES) {
      expect(milestone.multiplier).toBeGreaterThan(1)
    }
  })
})
