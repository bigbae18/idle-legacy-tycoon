import type { BusinessDefinition } from '../types'

/**
 * Era 1 — Prehistoria (moneda: Sustento). Números de arranque del GDD §3,
 * pendientes del pase de balance (R8). El orden del array es el orden de
 * desbloqueo y de presentación en la UI.
 */
export const PREHISTORIA: BusinessDefinition[] = [
  {
    id: 'bayas',
    name: 'Recolección de bayas',
    baseCost: 4,
    costGrowth: 1.09,
    cycleMs: 2_000,
    baseOutputPerCycle: 1,
  },
  {
    id: 'hoguera',
    name: 'Hoguera',
    baseCost: 60,
    costGrowth: 1.12,
    cycleMs: 6_000,
    baseOutputPerCycle: 6,
  },
  {
    id: 'caza',
    name: 'Caza mayor',
    baseCost: 900,
    costGrowth: 1.14,
    cycleMs: 15_000,
    baseOutputPerCycle: 50,
  },
  {
    id: 'silex',
    name: 'Taller de sílex',
    baseCost: 14_000,
    costGrowth: 1.17,
    cycleMs: 40_000,
    baseOutputPerCycle: 550,
  },
  {
    id: 'pinturas',
    name: 'Pinturas rupestres',
    baseCost: 220_000,
    costGrowth: 1.2,
    cycleMs: 100_000,
    baseOutputPerCycle: 7_500,
  },
]
