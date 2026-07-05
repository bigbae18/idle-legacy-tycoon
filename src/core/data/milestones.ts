import type { MilestoneDefinition } from '../types'

/**
 * Hitos de nivel compartidos por todos los negocios (GDD §3): 10/25/50/100/200,
 * en orden ascendente. Alternan producción ×2 y ciclo a la mitad — refinamiento del
 * usuario (2026-07-05): subir de nivel mejora tanto la cantidad como el tiempo de
 * recolecta. Números de arranque, tuneables en el pase de balance (R8).
 */
export const MILESTONES: MilestoneDefinition[] = [
  { level: 10, effect: 'production', multiplier: 2 },
  { level: 25, effect: 'speed', multiplier: 2 },
  { level: 50, effect: 'production', multiplier: 2 },
  { level: 100, effect: 'speed', multiplier: 2 },
  { level: 200, effect: 'production', multiplier: 2 },
]
