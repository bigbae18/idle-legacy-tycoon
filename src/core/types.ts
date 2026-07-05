/**
 * Definición estática de un negocio (catálogo de datos, tuneable sin tocar lógica — GDD §1.4).
 * La economía es una CADENA (R2.5, referencia AdVenture Communist/Ages): el orden del catálogo
 * define qué produce cada negocio — el primero produce el recurso/moneda de la era; cada
 * negocio posterior produce unidades del anterior.
 */
export interface BusinessDefinition {
  id: string
  name: string
  /** Coste de la primera unidad, en moneda de la era. Las siguientes escalan con costGrowth. */
  baseCost: number
  /** Factor de crecimiento del coste por unidad COMPRADA (> 1) — lo producido no encarece. */
  costGrowth: number
  /** Duración base del ciclo de producción, en milisegundos (los hitos de velocidad la reducen). */
  cycleMs: number
  /** Producción por ciclo y unidad: moneda (primer negocio) o unidades del negocio anterior. */
  baseOutputPerCycle: number
}

/**
 * Hito por unidades totales (GDD §3): al alcanzar `count` unidades, multiplica la producción
 * por ciclo (`production`) o la velocidad del ciclo (`speed` — divide su duración).
 */
export interface MilestoneDefinition {
  count: number
  effect: 'production' | 'speed'
  multiplier: number
}

/** Estado de un negocio de la cadena. */
export interface BusinessState {
  /** Unidades totales (compradas + producidas por el eslabón superior). Derivan la producción y los hitos. */
  count: number
  /** Unidades compradas con moneda: SOLO estas escalan el precio (regla clave de la cascada, R2.5). */
  purchased: number
  /** Progreso del ciclo en curso, en ms; null = en reposo. */
  cycleElapsedMs: number | null
}

/**
 * Estado FUENTE del juego: solo lo que no puede derivarse. La producción se calcula
 * siempre a partir de unidades + catálogo, nunca se almacena (bug 2 del GDD §10).
 */
export interface GameState {
  /** Moneda/recurso de la era activa (Prehistoria: Bayas). */
  currency: number
  /** id de negocio → estado (ausente o 0 unidades = aún no desbloqueado). */
  businesses: Record<string, BusinessState>
}
