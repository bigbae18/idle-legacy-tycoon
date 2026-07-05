import { describe, expect, it } from 'vitest'
import { migrateToCurrent } from './index'

const NOW = 1_751_800_000_000

/** Save v1 tal como lo escribía MVP-4: un solo recurso, una sola mejora, rate derivado persistido. */
const V1_SAVE = { schemaVersion: 1, state: { amount: 500, rate: 0.006, upgradeLevel: 5 } }

/** Save v2 tal como lo escribía R0: niveles planos, sin estado de ciclo. */
const V2_SAVE = {
  schemaVersion: 2,
  savedAt: NOW - 60_000,
  state: { currency: 42, businesses: { bayas: 3, hoguera: 1 } },
}

const V3_SAVE = {
  schemaVersion: 3,
  savedAt: NOW - 30_000,
  state: {
    currency: 42,
    businesses: {
      bayas: { level: 3, cycleElapsedMs: 1200 },
      hoguera: { level: 1, cycleElapsedMs: null },
    },
  },
}

describe('migrateToCurrent', () => {
  it('un save v3 válido pasa tal cual, sin re-migrar (incluido el ciclo en curso)', () => {
    expect(migrateToCurrent(V3_SAVE, NOW)).toEqual(V3_SAVE)
  })

  it('migra un save v2: cada nivel plano pasa a {level, cycleElapsedMs: null}, savedAt se conserva', () => {
    const result = migrateToCurrent(V2_SAVE, NOW)

    expect(result).not.toBeNull()
    expect(result?.schemaVersion).toBe(3)
    expect(result?.savedAt).toBe(NOW - 60_000)
    expect(result?.state.currency).toBe(42)
    expect(result?.state.businesses.bayas).toEqual({ level: 3, cycleElapsedMs: null })
    expect(result?.state.businesses.hoguera).toEqual({ level: 1, cycleElapsedMs: null })
  })

  it('migra un save v1 encadenando v1→v2→v3: amount→currency, upgradeLevel→nivel de bayas (+1 del gratis), rate descartado', () => {
    const result = migrateToCurrent(V1_SAVE, NOW)

    expect(result).not.toBeNull()
    expect(result?.schemaVersion).toBe(3)
    expect(result?.savedAt).toBe(NOW)
    expect(result?.state.currency).toBe(500)
    expect(result?.state.businesses.bayas).toEqual({ level: 6, cycleElapsedMs: null })
    expect(result?.state.businesses.pinturas).toEqual({ level: 0, cycleElapsedMs: null })
    expect(result?.state).not.toHaveProperty('rate')
  })

  it('rechaza state:null aunque typeof null sea "object" (bug 1 del GDD §10)', () => {
    expect(migrateToCurrent({ schemaVersion: 3, savedAt: NOW, state: null }, NOW)).toBeNull()
    expect(migrateToCurrent({ schemaVersion: 2, savedAt: NOW, state: null }, NOW)).toBeNull()
    expect(migrateToCurrent({ schemaVersion: 1, state: null }, NOW)).toBeNull()
  })

  it('rechaza currency no numérica, NaN o negativa (save envenenado)', () => {
    const base = { schemaVersion: 3, savedAt: NOW }
    expect(migrateToCurrent({ ...base, state: { currency: NaN, businesses: {} } }, NOW)).toBeNull()
    expect(migrateToCurrent({ ...base, state: { currency: '9', businesses: {} } }, NOW)).toBeNull()
    expect(migrateToCurrent({ ...base, state: { currency: -1, businesses: {} } }, NOW)).toBeNull()
    expect(migrateToCurrent({ ...base, state: { businesses: {} } }, NOW)).toBeNull()
  })

  it('rechaza estados de negocio v3 envenenados (nivel no entero, ciclo negativo o de tipo raro)', () => {
    const withBusiness = (business: unknown) => ({
      schemaVersion: 3,
      savedAt: NOW,
      state: { currency: 1, businesses: { bayas: business } },
    })

    expect(migrateToCurrent(withBusiness(3), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness(null), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness({ level: 1.5, cycleElapsedMs: null }), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness({ level: -2, cycleElapsedMs: null }), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness({ level: 1, cycleElapsedMs: -50 }), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness({ level: 1, cycleElapsedMs: '3' }), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness({ cycleElapsedMs: null }), NOW)).toBeNull()
  })

  it('un negocio v3 sin cycleElapsedMs (campo ausente) se normaliza a reposo en vez de rechazarse', () => {
    const result = migrateToCurrent(
      { schemaVersion: 3, savedAt: NOW, state: { currency: 1, businesses: { bayas: { level: 2 } } } },
      NOW,
    )

    expect(result?.state.businesses.bayas).toEqual({ level: 2, cycleElapsedMs: null })
  })

  it('rechaza niveles v2 que no sean enteros ≥ 0', () => {
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
