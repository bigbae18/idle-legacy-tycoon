import { productionMultiplier, speedMultiplier } from './milestones'
import type { BusinessDefinition, BusinessState, GameState } from './types'

const EMPTY: BusinessState = { count: 0, purchased: 0, cycleElapsedMs: null }

/** Estado de partida: el primer eslabón de la cadena viene con 1 unidad gratis (GDD §3). */
export function createInitialState(catalog: BusinessDefinition[]): GameState {
  const businesses: Record<string, BusinessState> = {}
  for (const [index, business] of catalog.entries()) {
    const starting = index === 0 ? 1 : 0
    businesses[business.id] = { count: starting, purchased: starting, cycleElapsedMs: null }
  }
  return { currency: 0, businesses }
}

/** Unidades totales del negocio (compradas + producidas). */
export function businessCount(state: GameState, businessId: string): number {
  return state.businesses[businessId]?.count ?? 0
}

/**
 * Coste de la siguiente unidad con `purchased` ya compradas: base × crecimiento^compradas.
 * Escala SOLO con lo comprado — las unidades producidas por la cascada no encarecen
 * (nuestro sustituto de los "comrades" de AdVenture Communist, decisión R2.5).
 */
export function unitCost(business: BusinessDefinition, purchased: number): number {
  return Math.ceil(business.baseCost * business.costGrowth ** purchased)
}

/** Producción por ciclo: unidades totales × base × hitos de producción (GDD §3). */
export function outputPerCycle(business: BusinessDefinition, count: number): number {
  return count * business.baseOutputPerCycle * productionMultiplier(count)
}

/** Duración real del ciclo: base ÷ hitos de velocidad (GDD §3). */
export function cycleDurationMs(business: BusinessDefinition, count: number): number {
  return business.cycleMs / speedMultiplier(count)
}

/** Coste total de comprar `count` unidades seguidas partiendo de `purchased` compradas. */
export function bulkCost(business: BusinessDefinition, purchased: number, count: number): number {
  let total = 0
  for (let i = 0; i < count; i++) {
    total += unitCost(business, purchased + i)
  }
  return total
}

/** Cuántas unidades seguidas alcanzan los fondos partiendo de `purchased` (para la compra ×máx). */
export function maxAffordable(
  business: BusinessDefinition,
  purchased: number,
  currency: number,
): number {
  let count = 0
  let remaining = currency
  let cost = unitCost(business, purchased)
  while (remaining >= cost) {
    remaining -= cost
    count += 1
    cost = unitCost(business, purchased + count)
  }
  return count
}

/** Compra exactamente `count` unidades si alcanzan los fondos (todo o nada); si no, no-op. */
export function purchaseUnits(
  state: GameState,
  business: BusinessDefinition,
  count: number,
): GameState {
  if (count < 1) return state

  const current = state.businesses[business.id] ?? EMPTY
  const cost = bulkCost(business, current.purchased, count)
  if (state.currency < cost) return state

  return {
    ...state,
    currency: state.currency - cost,
    businesses: {
      ...state.businesses,
      [business.id]: {
        ...current,
        count: current.count + count,
        purchased: current.purchased + count,
      },
    },
  }
}

/** Tap del jugador: lanza el ciclo del negocio si tiene unidades y está en reposo (GDD §3). */
export function startCycle(state: GameState, businessId: string): GameState {
  const current = state.businesses[businessId]
  if (!current || current.count < 1 || current.cycleElapsedMs !== null) return state

  return {
    ...state,
    businesses: {
      ...state.businesses,
      [businessId]: { ...current, cycleElapsedMs: 0 },
    },
  }
}
