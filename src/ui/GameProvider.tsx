import type { ReactNode } from 'react'
import { GameContext } from './GameContext'
import { useGameLoop } from './hooks/useGameLoop'
import type { GameState } from '../core/types'

interface GameProviderProps {
  initialState: GameState
  children: ReactNode
}

export function GameProvider({ initialState, children }: GameProviderProps) {
  const [state, setState] = useGameLoop(initialState)

  return <GameContext.Provider value={{ state, setState }}>{children}</GameContext.Provider>
}
