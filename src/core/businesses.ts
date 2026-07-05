import type { BusinessDefinition, GameState } from './types'

/** Estado de partida: el primer negocio del catálogo viene desbloqueado a nivel 1 (GDD §3). */
export function createInitialState(catalog: BusinessDefinition[]): GameState {
  const businesses: Record<string, number> = {}
  for (const [index, business] of catalog.entries()) {
    businesses[business.id] = index === 0 ? 1 : 0
  }
  return { currency: 0, businesses }
}

export function businessLevel(state: GameState, businessId: string): number {
  return state.businesses[businessId] ?? 0
}

/** Coste de comprar el siguiente nivel estando en `level`: base × crecimiento^nivel. */
export function levelCost(business: BusinessDefinition, level: number): number {
  return Math.ceil(business.baseCost * business.costGrowth ** level)
}

/** Compra un nivel del negocio si hay fondos; si no, devuelve el estado sin cambios. */
export function purchaseLevel(state: GameState, business: BusinessDefinition): GameState {
  const level = businessLevel(state, business.id)
  const cost = levelCost(business, level)
  if (state.currency < cost) {
    return state
  }

  return {
    ...state,
    currency: state.currency - cost,
    businesses: { ...state.businesses, [business.id]: level + 1 },
  }
}

/**
 * Producción media derivada, por milisegundo: Σ nivel × producción/ciclo ÷ duración.
 * En R0 la producción es continua (esta media); R1 la sustituye por ciclos reales con
 * barra de progreso — ver decisión de implementación en el GDD §11.
 */
export function productionPerMs(state: GameState, catalog: BusinessDefinition[]): number {
  let total = 0
  for (const business of catalog) {
    total += (businessLevel(state, business.id) * business.baseOutputPerCycle) / business.cycleMs
  }
  return total
}
