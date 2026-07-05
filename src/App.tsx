import { useState } from 'react'
import {
  businessLevel,
  bulkCost,
  createInitialState,
  cycleDurationMs,
  maxAffordable,
  outputPerCycle,
  purchaseLevels,
  startCycle,
} from './core/businesses'
import { PREHISTORIA } from './core/data/prehistoria'
import { nextMilestone } from './core/milestones'
import { clearSave } from './persistence/save'
import { localStorageAdapter } from './persistence/storageAdapter'
import { BusinessCard, type BusinessCardData } from './ui/components/BusinessCard/BusinessCard'
import {
  BuyMultiplierSelector,
  type BuyMultiplier,
} from './ui/components/BuyMultiplierSelector/BuyMultiplierSelector'
import { ResetButton } from './ui/components/ResetButton/ResetButton'
import { ResourceDisplay } from './ui/components/ResourceDisplay/ResourceDisplay'
import { GameProvider } from './ui/GameProvider'
import { useGame } from './ui/hooks/useGame'

function GameScreen() {
  const { state, setState } = useGame()
  // Preferencia de sesión, no se persiste (decisión R1); R3 gateará ×10/×máx tras Renombre 3
  const [multiplier, setMultiplier] = useState<BuyMultiplier>(1)

  const cards: BusinessCardData[] = PREHISTORIA.map((business) => {
    const current = state.businesses[business.id] ?? { level: 0, cycleElapsedMs: null }
    // A nivel 0 la card enseña lo que produciría el nivel 1 (vista previa del desbloqueo)
    const displayLevel = Math.max(current.level, 1)
    const duration = cycleDurationMs(business, displayLevel)
    const count =
      multiplier === 'max'
        ? Math.max(1, maxAffordable(business, current.level, state.currency))
        : multiplier
    const cost = bulkCost(business, current.level, count)

    return {
      id: business.id,
      name: business.name,
      level: current.level,
      outputPerCycle: outputPerCycle(business, displayLevel),
      cycleDurationMs: duration,
      cycleProgress:
        current.cycleElapsedMs === null ? null : Math.min(current.cycleElapsedMs / duration, 1),
      nextMilestone: nextMilestone(current.level),
      purchase: { count, cost, canAfford: state.currency >= cost },
    }
  })

  const handleTap = (businessId: string) => {
    setState((previous) => startCycle(previous, businessId))
  }

  const handlePurchase = (businessId: string) => {
    const business = PREHISTORIA.find((candidate) => candidate.id === businessId)
    if (!business) return
    // El lote se recalcula contra el estado del momento de la compra, no del render
    setState((previous) => {
      const level = businessLevel(previous, business.id)
      const count =
        multiplier === 'max' ? maxAffordable(business, level, previous.currency) : multiplier
      return purchaseLevels(previous, business, count)
    })
  }

  const handleReset = () => {
    clearSave(localStorageAdapter)
    setState(createInitialState(PREHISTORIA))
  }

  return (
    <div className="game-card">
      <ResourceDisplay amount={state.currency} label="Sustento" />
      <p className="currency-label">Sustento</p>
      <BuyMultiplierSelector value={multiplier} onChange={setMultiplier} />
      <ul className="business-list">
        {cards.map((card) => (
          <BusinessCard key={card.id} business={card} onTap={handleTap} onPurchase={handlePurchase} />
        ))}
      </ul>
      <ResetButton onReset={handleReset} />
    </div>
  )
}

function App() {
  return (
    <GameProvider initialState={createInitialState(PREHISTORIA)}>
      <main className="app">
        <h1>Idle Legacy Tycoon</h1>
        <GameScreen />
      </main>
    </GameProvider>
  )
}

export default App
