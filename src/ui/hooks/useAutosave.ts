import { useEffect, useRef } from 'react'
import { save } from '../../persistence/save'
import { localStorageAdapter } from '../../persistence/storageAdapter'
import type { GameState } from '../../core/types'

const AUTOSAVE_INTERVAL_MS = 10_000

/**
 * Guarda por intervalo y al ocultar la pestaña. Usa un ref para el estado en vez de
 * dependencia del efecto: `state` cambia cada tick (100ms) y recrear el intervalo/listener
 * a ese ritmo sería un desperdicio y podría perder el guardado en el instante del cambio.
 */
export function useAutosave(state: GameState): void {
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const intervalId = setInterval(() => {
      save(stateRef.current, localStorageAdapter)
    }, AUTOSAVE_INTERVAL_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        save(stateRef.current, localStorageAdapter)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
