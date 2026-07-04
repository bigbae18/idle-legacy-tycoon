import { describe, expect, it } from 'vitest'
import { formatNumber, perSecondToPerMs } from './numbers'

describe('perSecondToPerMs', () => {
  it('convierte una tasa por segundo a la unidad interna por milisegundo', () => {
    expect(perSecondToPerMs(1)).toBe(0.001)
    expect(perSecondToPerMs(10)).toBe(0.01)
  })

  it('con 0 por segundo, da 0 por milisegundo', () => {
    expect(perSecondToPerMs(0)).toBe(0)
  })
})

describe('formatNumber', () => {
  it('por debajo de 1000 muestra el entero tal cual', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(999)).toBe('999')
  })

  it('a partir de 1000 usa el sufijo K con un decimal', () => {
    expect(formatNumber(1000)).toBe('1.0K')
    expect(formatNumber(1234)).toBe('1.2K')
  })

  it('a partir de 1 millón usa el sufijo M', () => {
    expect(formatNumber(1_500_000)).toBe('1.5M')
  })

  it('a partir de 1000 millones usa el sufijo B', () => {
    expect(formatNumber(2_300_000_000)).toBe('2.3B')
  })

  it('trunca decimales del valor de entrada antes de formatear', () => {
    expect(formatNumber(999.9)).toBe('999')
  })
})
