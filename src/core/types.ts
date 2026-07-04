export interface GameState {
  /** Cantidad acumulada del recurso. */
  amount: number
  /** Producción por milisegundo. Unidad interna del motor; la UI la traduce a "por segundo" para mostrarla. */
  rate: number
  /** Veces que se ha comprado la mejora de producción. */
  upgradeLevel: number
}
