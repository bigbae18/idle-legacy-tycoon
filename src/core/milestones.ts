import { MILESTONES } from './data/milestones'
import type { MilestoneDefinition } from './types'

/** Multiplicador de producción acumulado por los hitos de producción ya alcanzados. */
export function productionMultiplier(count: number, milestones = MILESTONES): number {
  return accumulate('production', count, milestones)
}

/** Multiplicador de velocidad acumulado por los hitos de velocidad ya alcanzados (divide la duración del ciclo). */
export function speedMultiplier(count: number, milestones = MILESTONES): number {
  return accumulate('speed', count, milestones)
}

/** Primer hito aún no alcanzado (para el marcador "próximo hito" de la card), o null si están todos. */
export function nextMilestone(
  count: number,
  milestones = MILESTONES,
): MilestoneDefinition | null {
  return milestones.find((milestone) => count < milestone.count) ?? null
}

function accumulate(
  effect: MilestoneDefinition['effect'],
  count: number,
  milestones: MilestoneDefinition[],
): number {
  let multiplier = 1
  for (const milestone of milestones) {
    if (milestone.effect === effect && count >= milestone.count) {
      multiplier *= milestone.multiplier
    }
  }
  return multiplier
}
