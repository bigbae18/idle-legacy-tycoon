import { productionMultiplier, speedMultiplier } from './milestones'
import type { BusinessDefinition, BusinessState, GameState } from './types'

const IDLE: BusinessState = { level: 0, cycleElapsedMs: null }

/** Estado de partida: el primer negocio del catálogo viene desbloqueado a nivel 1 (GDD §3). */
export function createInitialState(catalog: BusinessDefinition[]): GameState {
  const businesses: Record<string, BusinessState> = {}
  for (const [index, business] of catalog.entries()) {
    businesses[business.id] = { level: index === 0 ? 1 : 0, cycleElapsedMs: null }
  }
  return { currency: 0, businesses }
}

export function businessLevel(state: GameState, businessId: string): number {
  return state.businesses[businessId]?.level ?? 0
}

/** Coste de comprar el siguiente nivel estando en `level`: base × crecimiento^nivel. */
export function levelCost(business: BusinessDefinition, level: number): number {
  return Math.ceil(business.baseCost * business.costGrowth ** level)
}

/** Producción por ciclo al nivel dado: nivel × base × hitos de producción (GDD §3). */
export function outputPerCycle(business: BusinessDefinition, level: number): number {
  return level * business.baseOutputPerCycle * productionMultiplier(level)
}

/** Duración real del ciclo al nivel dado: base ÷ hitos de velocidad (GDD §3). */
export function cycleDurationMs(business: BusinessDefinition, level: number): number {
  return business.cycleMs / speedMultiplier(level)
}

/** Coste total de comprar `count` niveles seguidos partiendo de `level` (suma de costes por nivel). */
export function bulkCost(business: BusinessDefinition, level: number, count: number): number {
  let total = 0
  for (let i = 0; i < count; i++) {
    total += levelCost(business, level + i)
  }
  return total
}

/** Cuántos niveles seguidos alcanzan los fondos partiendo de `level` (para la compra ×máx). */
export function maxAffordable(
  business: BusinessDefinition,
  level: number,
  currency: number,
): number {
  let count = 0
  let remaining = currency
  let cost = levelCost(business, level)
  while (remaining >= cost) {
    remaining -= cost
    count += 1
    cost = levelCost(business, level + count)
  }
  return count
}

/** Compra exactamente `count` niveles si alcanzan los fondos (todo o nada); si no, no-op. */
export function purchaseLevels(
  state: GameState,
  business: BusinessDefinition,
  count: number,
): GameState {
  if (count < 1) return state

  const current = state.businesses[business.id] ?? IDLE
  const cost = bulkCost(business, current.level, count)
  if (state.currency < cost) return state

  return {
    ...state,
    currency: state.currency - cost,
    businesses: {
      ...state.businesses,
      [business.id]: { ...current, level: current.level + count },
    },
  }
}

/** Tap del jugador: lanza el ciclo del negocio si tiene nivel y está en reposo (GDD §3). */
export function startCycle(state: GameState, businessId: string): GameState {
  const current = state.businesses[businessId]
  if (!current || current.level < 1 || current.cycleElapsedMs !== null) return state

  return {
    ...state,
    businesses: {
      ...state.businesses,
      [businessId]: { ...current, cycleElapsedMs: 0 },
    },
  }
}
