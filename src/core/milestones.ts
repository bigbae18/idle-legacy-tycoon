import { MILESTONES } from './data/milestones'
import type { MilestoneDefinition } from './types'

/** Multiplicador de producción acumulado por los hitos de producción ya alcanzados. */
export function productionMultiplier(level: number, milestones = MILESTONES): number {
  return accumulate('production', level, milestones)
}

/** Multiplicador de velocidad acumulado por los hitos de velocidad ya alcanzados (divide la duración del ciclo). */
export function speedMultiplier(level: number, milestones = MILESTONES): number {
  return accumulate('speed', level, milestones)
}

/** Primer hito aún no alcanzado (para el marcador "próximo hito" de la card), o null si están todos. */
export function nextMilestone(
  level: number,
  milestones = MILESTONES,
): MilestoneDefinition | null {
  return milestones.find((milestone) => level < milestone.level) ?? null
}

function accumulate(
  effect: MilestoneDefinition['effect'],
  level: number,
  milestones: MilestoneDefinition[],
): number {
  let multiplier = 1
  for (const milestone of milestones) {
    if (milestone.effect === effect && level >= milestone.level) {
      multiplier *= milestone.multiplier
    }
  }
  return multiplier
}
