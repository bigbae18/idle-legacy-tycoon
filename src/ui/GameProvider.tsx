import { useState, type ReactNode } from 'react'
import { GameContext } from './GameContext'
import { useAutosave } from './hooks/useAutosave'
import { useGameLoop } from './hooks/useGameLoop'
import { load } from '../persistence/load'
import { localStorageAdapter } from '../persistence/storageAdapter'
import type { GameState } from '../core/types'

interface GameProviderProps {
  initialState: GameState
  children: ReactNode
}

export function GameProvider({ initialState, children }: GameProviderProps) {
  const [startingState] = useState(() => load(localStorageAdapter, initialState))
  const [state, setState] = useGameLoop(startingState)
  useAutosave(state)

  return <GameContext.Provider value={{ state, setState }}>{children}</GameContext.Provider>
}
