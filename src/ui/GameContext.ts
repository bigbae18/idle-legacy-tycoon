import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { OfflineSummary } from '../core/offline'
import type { GameState } from '../core/types'

export interface GameContextValue {
  state: GameState
  setState: Dispatch<SetStateAction<GameState>>
  /** Resumen del último periodo fuera con cobro, pendiente de mostrar; null si no hay. */
  offlineSummary: OfflineSummary | null
  dismissOfflineSummary: () => void
}

export const GameContext = createContext<GameContextValue | null>(null)
