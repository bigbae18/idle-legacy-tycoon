import { useContext } from 'react'
import { GameContext, type GameContextValue } from '../GameContext'

export function useGame(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame debe usarse dentro de un GameProvider')
  }
  return context
}
