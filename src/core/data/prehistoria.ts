import type { BusinessDefinition } from '../types'

/**
 * Era 1 — Prehistoria (recurso/moneda: **Bayas**). Cadena de producción (R2.5, orden
 * del array = cadena): los Recolectores producen Bayas; cada negocio posterior produce
 * unidades del anterior — las Hogueras atraen Recolectores, las Partidas de caza
 * alimentan Hogueras, los Talleres de sílex arman Partidas, las Pinturas rupestres
 * transmiten el saber que funda Talleres. Números de arranque del GDD §3, pendientes
 * del pase de balance (R8).
 */
export const PREHISTORIA: BusinessDefinition[] = [
  {
    id: 'recolectores',
    name: 'Recolectores',
    baseCost: 4,
    costGrowth: 1.09,
    cycleMs: 2_000,
    baseOutputPerCycle: 1,
  },
  {
    id: 'hoguera',
    name: 'Hogueras',
    baseCost: 60,
    costGrowth: 1.12,
    cycleMs: 6_000,
    baseOutputPerCycle: 1,
  },
  {
    id: 'caza',
    name: 'Partidas de caza',
    baseCost: 900,
    costGrowth: 1.14,
    cycleMs: 15_000,
    baseOutputPerCycle: 1,
  },
  {
    id: 'silex',
    name: 'Talleres de sílex',
    baseCost: 14_000,
    costGrowth: 1.17,
    cycleMs: 40_000,
    baseOutputPerCycle: 1,
  },
  {
    id: 'pinturas',
    name: 'Pinturas rupestres',
    baseCost: 220_000,
    costGrowth: 1.2,
    cycleMs: 100_000,
    baseOutputPerCycle: 1,
  },
]
