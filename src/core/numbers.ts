const MS_PER_SECOND = 1000

/** Convierte una tasa "por segundo" (unidad legible al configurar) a "por milisegundo" (unidad interna de tick.ts). */
export function perSecondToPerMs(perSecond: number): number {
  return perSecond / MS_PER_SECOND
}

const SUFFIXES: Array<{ threshold: number; suffix: string }> = [
  { threshold: 1_000_000_000, suffix: 'B' },
  { threshold: 1_000_000, suffix: 'M' },
  { threshold: 1_000, suffix: 'K' },
]

/** Formatea un recurso para mostrarlo: enteros hasta 999, luego sufijo K/M/B con un decimal. */
export function formatNumber(value: number): string {
  const floored = Math.floor(value)

  for (const { threshold, suffix } of SUFFIXES) {
    if (floored >= threshold) {
      return `${(floored / threshold).toFixed(1)}${suffix}`
    }
  }

  return String(floored)
}
