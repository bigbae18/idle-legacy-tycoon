import { useState } from 'react'
import {
  bulkCost,
  createInitialState,
  cycleDurationMs,
  maxAffordable,
  outputPerCycle,
  purchaseUnits,
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
import { OfflineEarningsModal } from './ui/components/OfflineEarningsModal/OfflineEarningsModal'
import { ResetButton } from './ui/components/ResetButton/ResetButton'
import { ResourceDisplay } from './ui/components/ResourceDisplay/ResourceDisplay'
import { GameProvider } from './ui/GameProvider'
import { useGame } from './ui/hooks/useGame'

/** Nombre del recurso de la era activa (Prehistoria). Con R5 (multi-era) saldrá del catálogo de eras. */
const CURRENCY_NAME = 'Bayas'

function GameScreen() {
  const { state, setState, offlineSummary, dismissOfflineSummary } = useGame()
  // Preferencia de sesión, no se persiste (decisión R1); R3 gateará ×10/×máx tras Renombre 3
  const [multiplier, setMultiplier] = useState<BuyMultiplier>(1)

  const cards: BusinessCardData[] = PREHISTORIA.map((business, index) => {
    const current = state.businesses[business.id] ?? {
      count: 0,
      purchased: 0,
      cycleElapsedMs: null,
    }
    // A 0 unidades la card enseña lo que produciría la primera (vista previa del desbloqueo)
    const displayCount = Math.max(current.count, 1)
    const duration = cycleDurationMs(business, displayCount)
    const count =
      multiplier === 'max'
        ? Math.max(1, maxAffordable(business, current.purchased, state.currency))
        : multiplier
    const cost = bulkCost(business, current.purchased, count)

    return {
      id: business.id,
      name: business.name,
      owned: current.count,
      producesLabel: index === 0 ? CURRENCY_NAME : PREHISTORIA[index - 1].name,
      outputPerCycle: outputPerCycle(business, displayCount),
      cycleDurationMs: duration,
      cycleProgress:
        current.cycleElapsedMs === null ? null : Math.min(current.cycleElapsedMs / duration, 1),
      nextMilestone: nextMilestone(current.count),
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
      const purchased = previous.businesses[business.id]?.purchased ?? 0
      const count =
        multiplier === 'max' ? maxAffordable(business, purchased, previous.currency) : multiplier
      return purchaseUnits(previous, business, count)
    })
  }

  const handleReset = () => {
    clearSave(localStorageAdapter)
    setState(createInitialState(PREHISTORIA))
  }

  return (
    <div className="game-card">
      {offlineSummary && (
        <OfflineEarningsModal
          earned={offlineSummary.earned}
          elapsedMs={offlineSummary.elapsedMs}
          currencyName={CURRENCY_NAME}
          onClose={dismissOfflineSummary}
        />
      )}
      <ResourceDisplay amount={state.currency} label={CURRENCY_NAME} />
      <p className="currency-label">{CURRENCY_NAME}</p>
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
