import { useEffect, useRef, useState } from 'react'
import { tick } from '../../core/tick'
import type { GameState } from '../../core/types'

const TICK_INTERVAL_MS = 100

/** Bucle de juego: único sitio del proyecto que usa setInterval. Delega el cálculo en core/tick. */
export function useGameLoop(
  initialState: GameState,
): [GameState, React.Dispatch<React.SetStateAction<GameState>>] {
  const [state, setState] = useState(initialState)
  const lastTickAtRef = useRef(Date.now())

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now()
      const deltaMs = now - lastTickAtRef.current
      lastTickAtRef.current = now
      setState((previous) => tick(previous, deltaMs))
    }, TICK_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [])

  return [state, setState]
}
