import { upgradeCost, purchaseUpgrade } from './core/upgrades'
import { ResourceDisplay } from './ui/components/ResourceDisplay/ResourceDisplay'
import { UpgradeList } from './ui/components/UpgradeList/UpgradeList'
import { GameProvider } from './ui/GameProvider'
import { useGame } from './ui/hooks/useGame'

function GameScreen() {
  const { state, setState } = useGame()
  const cost = upgradeCost(state.upgradeLevel)

  return (
    <>
      <ResourceDisplay amount={state.amount} />
      <UpgradeList
        level={state.upgradeLevel}
        cost={cost}
        canAfford={state.amount >= cost}
        onPurchase={() => setState(purchaseUpgrade)}
      />
    </>
  )
}

function App() {
  return (
    <GameProvider initialState={{ amount: 0, rate: 1, upgradeLevel: 0 }}>
      <main>
        <h1>Idle Legacy Tycoon</h1>
        <GameScreen />
      </main>
    </GameProvider>
  )
}

export default App
