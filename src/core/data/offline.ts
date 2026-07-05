/**
 * Tope base de las ganancias offline: 8 h (GDD §7 — el cap de 2 h de Egg Inc. está
 * documentado como error que provoca abandono). Ampliable a 24 h vía el árbol del
 * Legado (R6): por eso el motor lo recibe como parámetro en vez de fijarlo.
 */
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000
