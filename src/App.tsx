import { upgradeCost, purchaseUpgrade } from './core/upgrades'
import { perSecondToPerMs } from './core/numbers'
import { ResourceDisplay } from './ui/components/ResourceDisplay/ResourceDisplay'
import { UpgradeList } from './ui/components/UpgradeList/UpgradeList'
import { GameProvider } from './ui/GameProvider'
import { useGame } from './ui/hooks/useGame'

/** Producción base de relleno: 1/seg (no es economía final, ver docs/plan-maestro.md). */
const INITIAL_RATE_PER_SECOND = 1

function GameScreen() {
  const { state, setState } = useGame()
  const cost = upgradeCost(state.upgradeLevel)

  return (
    <div className="game-card">
      <ResourceDisplay amount={state.amount} />
      <UpgradeList
        level={state.upgradeLevel}
        cost={cost}
        canAfford={state.amount >= cost}
        onPurchase={() => setState(purchaseUpgrade)}
      />
    </div>
  )
}

function App() {
  return (
    <GameProvider
      initialState={{
        amount: 0,
        rate: perSecondToPerMs(INITIAL_RATE_PER_SECOND),
        upgradeLevel: 0,
      }}
    >
      <main className="app">
        <h1>Idle Legacy Tycoon</h1>
        <GameScreen />
      </main>
    </GameProvider>
  )
}

export default App
