import { useEffect, useRef, useState } from 'react'
import { PREHISTORIA } from '../../core/data/prehistoria'
import { settleOffline, type OfflineSummary } from '../../core/offline'
import { MAX_TICK_DELTA_MS, tick } from '../../core/tick'
import type { GameState } from '../../core/types'

const TICK_INTERVAL_MS = 100

/**
 * Bucle de juego: único sitio del proyecto que usa setInterval. Delega el cálculo en
 * core/tick; un delta >60s (pestaña suspendida) se liquida por el flujo offline con
 * su tope (GDD §7, cierre del bug 3) y se notifica por `onLongGap` si hubo cobro.
 */
export function useGameLoop(
  initialState: GameState,
  onLongGap?: (summary: OfflineSummary) => void,
): [GameState, React.Dispatch<React.SetStateAction<GameState>>] {
  const [state, setState] = useState(initialState)
  const lastTickAtRef = useRef(Date.now())
  // refs para que el intervalo (creado una vez) vea siempre el estado/callback vigentes
  const stateRef = useRef(state)
  stateRef.current = state
  const onLongGapRef = useRef(onLongGap)
  onLongGapRef.current = onLongGap

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now()
      const deltaMs = now - lastTickAtRef.current
      lastTickAtRef.current = now

      if (deltaMs > MAX_TICK_DELTA_MS) {
        const summary = settleOffline(stateRef.current, now - deltaMs, now, PREHISTORIA)
        setState(summary.state)
        if (summary.earned > 0) {
          onLongGapRef.current?.(summary)
        }
        return
      }

      setState((previous) => tick(previous, deltaMs, PREHISTORIA))
    }, TICK_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [])

  return [state, setState]
}
