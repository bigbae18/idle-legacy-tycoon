/** Escala corta descendente (bug 4 del GDD §10): con 3 eras y ×1.000 entre eras, B se queda corto. */
const SUFFIXES: Array<{ threshold: number; suffix: string }> = [
  { threshold: 1e30, suffix: 'No' },
  { threshold: 1e27, suffix: 'Oc' },
  { threshold: 1e24, suffix: 'Sp' },
  { threshold: 1e21, suffix: 'Sx' },
  { threshold: 1e18, suffix: 'Qi' },
  { threshold: 1e15, suffix: 'Qa' },
  { threshold: 1e12, suffix: 'T' },
  { threshold: 1e9, suffix: 'B' },
  { threshold: 1e6, suffix: 'M' },
  { threshold: 1e3, suffix: 'K' },
]

/**
 * Formatea un recurso para mostrarlo: enteros hasta 999, sufijo con un decimal hasta
 * agotar la tabla, y notación exponencial más allá (nunca "1000.0No").
 */
export function formatNumber(value: number): string {
  const floored = Math.floor(value)

  if (floored >= 1e33) {
    return floored.toExponential(2)
  }

  for (const { threshold, suffix } of SUFFIXES) {
    if (floored >= threshold) {
      return `${(floored / threshold).toFixed(1)}${suffix}`
    }
  }

  return String(floored)
}
