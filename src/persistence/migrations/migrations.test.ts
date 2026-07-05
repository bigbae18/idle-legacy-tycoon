import { describe, expect, it } from 'vitest'
import { migrateToCurrent } from './index'

const NOW = 1_751_800_000_000

/** Save v1 tal como lo escribía MVP-4: un solo recurso, una sola mejora, rate derivado persistido. */
const V1_SAVE = { schemaVersion: 1, state: { amount: 500, rate: 0.006, upgradeLevel: 5 } }

const V2_SAVE = {
  schemaVersion: 2,
  savedAt: NOW - 60_000,
  state: { currency: 42, businesses: { bayas: 3, hoguera: 1 } },
}

describe('migrateToCurrent', () => {
  it('un save v2 válido pasa tal cual, sin re-migrar', () => {
    expect(migrateToCurrent(V2_SAVE, NOW)).toEqual(V2_SAVE)
  })

  it('migra un save v1: amount→currency, upgradeLevel→nivel de bayas (+1 del nivel gratis), rate descartado', () => {
    const result = migrateToCurrent(V1_SAVE, NOW)

    expect(result).not.toBeNull()
    expect(result?.schemaVersion).toBe(2)
    expect(result?.savedAt).toBe(NOW)
    expect(result?.state.currency).toBe(500)
    expect(result?.state.businesses.bayas).toBe(6)
    expect(result?.state.businesses.pinturas).toBe(0)
    expect(result?.state).not.toHaveProperty('rate')
  })

  it('rechaza state:null aunque typeof null sea "object" (bug 1 del GDD §10)', () => {
    expect(migrateToCurrent({ schemaVersion: 2, savedAt: NOW, state: null }, NOW)).toBeNull()
    expect(migrateToCurrent({ schemaVersion: 1, state: null }, NOW)).toBeNull()
  })

  it('rechaza currency no numérica, NaN o negativa (save envenenado)', () => {
    const base = { schemaVersion: 2, savedAt: NOW }
    expect(migrateToCurrent({ ...base, state: { currency: NaN, businesses: {} } }, NOW)).toBeNull()
    expect(migrateToCurrent({ ...base, state: { currency: '9', businesses: {} } }, NOW)).toBeNull()
    expect(migrateToCurrent({ ...base, state: { currency: -1, businesses: {} } }, NOW)).toBeNull()
    expect(migrateToCurrent({ ...base, state: { businesses: {} } }, NOW)).toBeNull()
  })

  it('rechaza niveles de negocio que no sean enteros ≥ 0', () => {
    const base = { schemaVersion: 2, savedAt: NOW }
    expect(
      migrateToCurrent({ ...base, state: { currency: 1, businesses: { bayas: NaN } } }, NOW),
    ).toBeNull()
    expect(
      migrateToCurrent({ ...base, state: { currency: 1, businesses: { bayas: -2 } } }, NOW),
    ).toBeNull()
    expect(
      migrateToCurrent({ ...base, state: { currency: 1, businesses: { bayas: 1.5 } } }, NOW),
    ).toBeNull()
  })

  it('rechaza un v1 con campos rotos en vez de migrar basura', () => {
    expect(
      migrateToCurrent({ schemaVersion: 1, state: { amount: NaN, rate: 1, upgradeLevel: 0 } }, NOW),
    ).toBeNull()
    expect(
      migrateToCurrent({ schemaVersion: 1, state: { amount: 5, rate: 1, upgradeLevel: -3 } }, NOW),
    ).toBeNull()
  })

  it('rechaza versiones de esquema desconocidas y formas arbitrarias', () => {
    expect(migrateToCurrent({ schemaVersion: 99, state: {} }, NOW)).toBeNull()
    expect(migrateToCurrent({ foo: 'bar' }, NOW)).toBeNull()
    expect(migrateToCurrent(null, NOW)).toBeNull()
    expect(migrateToCurrent('cadena', NOW)).toBeNull()
  })
})
