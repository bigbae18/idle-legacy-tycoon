import { describe, expect, it } from 'vitest'
import { purchaseUpgrade, upgradeCost } from './upgrades'
import type { GameState } from './types'

describe('upgradeCost', () => {
  it('escala con el nivel (cada nivel es más caro que el anterior)', () => {
    const costLevel0 = upgradeCost(0)
    const costLevel1 = upgradeCost(1)
    const costLevel2 = upgradeCost(2)

    expect(costLevel1).toBeGreaterThan(costLevel0)
    expect(costLevel2).toBeGreaterThan(costLevel1)
  })
})

describe('purchaseUpgrade', () => {
  it('sin fondos suficientes no hace nada', () => {
    const state: GameState = { amount: 0, rate: 0, upgradeLevel: 0 }

    const result = purchaseUpgrade(state)

    expect(result).toEqual(state)
  })

  it('con fondos suficientes descuenta el coste y sube de nivel', () => {
    const cost = upgradeCost(0)
    const state: GameState = { amount: cost, rate: 5, upgradeLevel: 0 }

    const result = purchaseUpgrade(state)

    expect(result.amount).toBe(0)
    expect(result.upgradeLevel).toBe(1)
    expect(result.rate).toBeGreaterThan(state.rate)
  })
})
