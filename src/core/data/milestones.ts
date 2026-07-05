import type { MilestoneDefinition } from '../types'

/**
 * Hitos por unidades totales, compartidos por todos los negocios (GDD §3). Tabla
 * duplicante: en la economía en cascada (R2.5) las unidades producidas por el eslabón
 * superior inflan los conteos rápido, así que los umbrales doblan sin fin práctico.
 * La velocidad solo dobla 3 veces (÷8 total) para que el ciclo no tienda a cero;
 * el resto es producción ×2. Números de arranque, tuneables en el pase de balance (R8).
 */
export const MILESTONES: MilestoneDefinition[] = [
  { count: 10, effect: 'production', multiplier: 2 },
  { count: 25, effect: 'speed', multiplier: 2 },
  { count: 50, effect: 'production', multiplier: 2 },
  { count: 100, effect: 'speed', multiplier: 2 },
  { count: 200, effect: 'production', multiplier: 2 },
  { count: 400, effect: 'production', multiplier: 2 },
  { count: 800, effect: 'speed', multiplier: 2 },
  { count: 1_600, effect: 'production', multiplier: 2 },
  { count: 3_200, effect: 'production', multiplier: 2 },
  { count: 6_400, effect: 'production', multiplier: 2 },
  { count: 12_800, effect: 'production', multiplier: 2 },
  { count: 25_600, effect: 'production', multiplier: 2 },
  { count: 51_200, effect: 'production', multiplier: 2 },
  { count: 102_400, effect: 'production', multiplier: 2 },
  { count: 204_800, effect: 'production', multiplier: 2 },
  { count: 409_600, effect: 'production', multiplier: 2 },
  { count: 819_200, effect: 'production', multiplier: 2 },
]
