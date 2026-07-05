/** Definición estática de un negocio (catálogo de datos, tuneable sin tocar lógica — GDD §1.4). */
export interface BusinessDefinition {
  id: string
  name: string
  /** Coste del nivel 1. El de niveles sucesivos escala con costGrowth (GDD §3). */
  baseCost: number
  /** Factor de crecimiento del coste por nivel (> 1). */
  costGrowth: number
  /** Duración del ciclo de producción, en milisegundos. */
  cycleMs: number
  /** Producción por ciclo a nivel 1 (escala linealmente con el nivel). */
  baseOutputPerCycle: number
}

/**
 * Estado FUENTE del juego: solo lo que no puede derivarse. La producción se calcula
 * siempre a partir de niveles + catálogo, nunca se almacena (bug 2 del GDD §10).
 */
export interface GameState {
  /** Moneda de la era activa (Prehistoria: Sustento). */
  currency: number
  /** id de negocio → nivel comprado (ausente o 0 = aún no desbloqueado). */
  businesses: Record<string, number>
}
