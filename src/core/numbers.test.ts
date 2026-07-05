import { describe, expect, it } from 'vitest'
import { formatDuration, formatNumber } from './numbers'

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

  it('por encima de B sigue la escala corta: T, Qa, Qi… (bug 4 del GDD §10)', () => {
    expect(formatNumber(1e12)).toBe('1.0T')
    expect(formatNumber(4.2e15)).toBe('4.2Qa')
    expect(formatNumber(9e18)).toBe('9.0Qi')
    expect(formatNumber(1.5e21)).toBe('1.5Sx')
    expect(formatNumber(2e24)).toBe('2.0Sp')
    expect(formatNumber(3e27)).toBe('3.0Oc')
    expect(formatNumber(7e30)).toBe('7.0No')
  })

  it('agotada la tabla de sufijos cae a notación exponencial en vez de "1000.0No"', () => {
    expect(formatNumber(1e33)).toBe('1.00e+33')
  })

  it('trunca decimales del valor de entrada antes de formatear', () => {
    expect(formatNumber(999.9)).toBe('999')
  })
})

describe('formatDuration', () => {
  it('por debajo del minuto muestra segundos', () => {
    expect(formatDuration(0)).toBe('0s')
    expect(formatDuration(500)).toBe('0s')
    expect(formatDuration(45_000)).toBe('45s')
  })

  it('a partir del minuto muestra minutos', () => {
    expect(formatDuration(60_000)).toBe('1m')
    expect(formatDuration(12 * 60_000)).toBe('12m')
  })

  it('a partir de la hora muestra "Xh Ym" (el formato del modal de retorno, GDD §7)', () => {
    expect(formatDuration(3 * 3_600_000 + 24 * 60_000)).toBe('3h 24m')
  })

  it('con minutos a cero omite el "0m"', () => {
    expect(formatDuration(3_600_000)).toBe('1h')
    expect(formatDuration(8 * 3_600_000)).toBe('8h')
  })
})
