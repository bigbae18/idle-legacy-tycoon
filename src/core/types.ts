/** Definición estática de un negocio (catálogo de datos, tuneable sin tocar lógica — GDD §1.4). */
export interface BusinessDefinition {
  id: string
  name: string
  /** Coste del nivel 1. El de niveles sucesivos escala con costGrowth (GDD §3). */
  baseCost: number
  /** Factor de crecimiento del coste por nivel (> 1). */
  costGrowth: number
  /** Duración base del ciclo de producción, en milisegundos (los hitos de velocidad la reducen). */
  cycleMs: number
  /** Producción por ciclo a nivel 1 (escala linealmente con el nivel). */
  baseOutputPerCycle: number
}

/**
 * Hito de nivel (GDD §3): al alcanzar `level`, multiplica la producción por ciclo
 * (`production`) o la velocidad del ciclo (`speed` — divide su duración).
 */
export interface MilestoneDefinition {
  level: number
  effect: 'production' | 'speed'
  multiplier: number
}

/** Estado de un negocio: nivel comprado y progreso del ciclo en curso (null = en reposo). */
export interface BusinessState {
  level: number
  cycleElapsedMs: number | null
}

/**
 * Estado FUENTE del juego: solo lo que no puede derivarse. La producción se calcula
 * siempre a partir de niveles + catálogo, nunca se almacena (bug 2 del GDD §10).
 */
export interface GameState {
  /** Moneda de la era activa (Prehistoria: Sustento). */
  currency: number
  /** id de negocio → estado (ausente o nivel 0 = aún no desbloqueado). */
  businesses: Record<string, BusinessState>
}
