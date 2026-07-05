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

/** Save v3 tal como lo escribía R1/R2: nivel único + ciclo, negocio 1 con id 'bayas'. */
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

const V4_SAVE = {
  schemaVersion: 4,
  savedAt: NOW - 10_000,
  state: {
    currency: 42,
    businesses: {
      recolectores: { count: 50, purchased: 3, cycleElapsedMs: 1200 },
      hoguera: { count: 1, purchased: 1, cycleElapsedMs: null },
    },
  },
}

describe('migrateToCurrent', () => {
  it('un save v4 válido pasa tal cual, sin re-migrar (count y purchased separados)', () => {
    expect(migrateToCurrent(V4_SAVE, NOW)).toEqual(V4_SAVE)
  })

  it('migra un save v3 (R1/R2): level → count y purchased, y renombra bayas→recolectores', () => {
    const result = migrateToCurrent(V3_SAVE, NOW)

    expect(result).not.toBeNull()
    expect(result?.schemaVersion).toBe(4)
    expect(result?.savedAt).toBe(NOW - 30_000)
    expect(result?.state.currency).toBe(42)
    expect(result?.state.businesses.recolectores).toEqual({
      count: 3,
      purchased: 3,
      cycleElapsedMs: 1200,
    })
    expect(result?.state.businesses.hoguera).toEqual({
      count: 1,
      purchased: 1,
      cycleElapsedMs: null,
    })
    expect(result?.state.businesses).not.toHaveProperty('bayas')
  })

  it('migra un save v2 (R0) encadenando v2→v3→v4', () => {
    const result = migrateToCurrent(V2_SAVE, NOW)

    expect(result?.schemaVersion).toBe(4)
    expect(result?.savedAt).toBe(NOW - 60_000)
    expect(result?.state.businesses.recolectores).toEqual({
      count: 3,
      purchased: 3,
      cycleElapsedMs: null,
    })
  })

  it('migra un save v1 (MVP-4) encadenando hasta v4: upgradeLevel→recolectores (+1 del gratis), rate descartado', () => {
    const result = migrateToCurrent(V1_SAVE, NOW)

    expect(result?.schemaVersion).toBe(4)
    expect(result?.savedAt).toBe(NOW)
    expect(result?.state.currency).toBe(500)
    expect(result?.state.businesses.recolectores).toEqual({
      count: 6,
      purchased: 6,
      cycleElapsedMs: null,
    })
    expect(result?.state.businesses.pinturas).toEqual({
      count: 0,
      purchased: 0,
      cycleElapsedMs: null,
    })
    expect(result?.state).not.toHaveProperty('rate')
  })

  it('rechaza state:null aunque typeof null sea "object" (bug 1 del GDD §10)', () => {
    for (const schemaVersion of [1, 2, 3, 4]) {
      expect(migrateToCurrent({ schemaVersion, savedAt: NOW, state: null }, NOW)).toBeNull()
    }
  })

  it('rechaza currency no numérica, NaN o negativa (save envenenado)', () => {
    const base = { schemaVersion: 4, savedAt: NOW }
    expect(migrateToCurrent({ ...base, state: { currency: NaN, businesses: {} } }, NOW)).toBeNull()
    expect(migrateToCurrent({ ...base, state: { currency: '9', businesses: {} } }, NOW)).toBeNull()
    expect(migrateToCurrent({ ...base, state: { currency: -1, businesses: {} } }, NOW)).toBeNull()
    expect(migrateToCurrent({ ...base, state: { businesses: {} } }, NOW)).toBeNull()
  })

  it('rechaza estados de negocio v4 envenenados', () => {
    const withBusiness = (business: unknown) => ({
      schemaVersion: 4,
      savedAt: NOW,
      state: { currency: 1, businesses: { recolectores: business } },
    })

    expect(migrateToCurrent(withBusiness(3), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness(null), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness({ count: 1.5, purchased: 1, cycleElapsedMs: null }), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness({ count: -2, purchased: 0, cycleElapsedMs: null }), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness({ count: 1, purchased: NaN, cycleElapsedMs: null }), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness({ count: 1, purchased: -1, cycleElapsedMs: null }), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness({ count: 1, purchased: 1, cycleElapsedMs: -50 }), NOW)).toBeNull()
    expect(migrateToCurrent(withBusiness({ purchased: 1, cycleElapsedMs: null }), NOW)).toBeNull()
  })

  it('normaliza campos v4 defaultables: sin cycleElapsedMs → reposo; sin purchased → igual a count', () => {
    const result = migrateToCurrent(
      {
        schemaVersion: 4,
        savedAt: NOW,
        state: { currency: 1, businesses: { recolectores: { count: 2 } } },
      },
      NOW,
    )

    expect(result?.state.businesses.recolectores).toEqual({
      count: 2,
      purchased: 2,
      cycleElapsedMs: null,
    })
  })

  it('rechaza un v3 con nivel roto en vez de migrar basura', () => {
    const base = { schemaVersion: 3, savedAt: NOW }
    expect(
      migrateToCurrent(
        { ...base, state: { currency: 1, businesses: { bayas: { level: -1, cycleElapsedMs: null } } } },
        NOW,
      ),
    ).toBeNull()
  })

  it('rechaza versiones de esquema desconocidas y formas arbitrarias', () => {
    expect(migrateToCurrent({ schemaVersion: 99, state: {} }, NOW)).toBeNull()
    expect(migrateToCurrent({ foo: 'bar' }, NOW)).toBeNull()
    expect(migrateToCurrent(null, NOW)).toBeNull()
    expect(migrateToCurrent('cadena', NOW)).toBeNull()
  })
})
