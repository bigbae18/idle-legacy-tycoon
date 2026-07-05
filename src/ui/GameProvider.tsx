import { useCallback, useState, type ReactNode } from 'react'
import { GameContext } from './GameContext'
import { useAutosave } from './hooks/useAutosave'
import { useGameLoop } from './hooks/useGameLoop'
import { PREHISTORIA } from '../core/data/prehistoria'
import { settleOffline, type OfflineSummary } from '../core/offline'
import { loadSave } from '../persistence/load'
import { localStorageAdapter } from '../persistence/storageAdapter'
import type { GameState } from '../core/types'

interface GameProviderProps {
  initialState: GameState
  children: ReactNode
}

export function GameProvider({ initialState, children }: GameProviderProps) {
  // Al arrancar: cargar save y liquidar el tiempo fuera desde savedAt (GDD §7).
  // El cobro se acredita ya aquí; el modal solo informa (cerrarlo no cambia nada).
  const [boot] = useState(() => {
    const saved = loadSave(localStorageAdapter)
    if (!saved) {
      return { state: initialState, summary: null }
    }
    const summary = settleOffline(saved.state, saved.savedAt, Date.now(), PREHISTORIA)
    return { state: summary.state, summary: summary.earned > 0 ? summary : null }
  })
  const [offlineSummary, setOfflineSummary] = useState<OfflineSummary | null>(boot.summary)
  const [state, setState] = useGameLoop(boot.state, setOfflineSummary)
  useAutosave(state)

  const dismissOfflineSummary = useCallback(() => setOfflineSummary(null), [])

  return (
    <GameContext.Provider value={{ state, setState, offlineSummary, dismissOfflineSummary }}>
      {children}
    </GameContext.Provider>
  )
}
