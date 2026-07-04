import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { GameState } from '../core/types'

export interface GameContextValue {
  state: GameState
  setState: Dispatch<SetStateAction<GameState>>
}

export const GameContext = createContext<GameContextValue | null>(null)
