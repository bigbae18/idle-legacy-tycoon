import { businessLevel, createInitialState, levelCost, purchaseLevel } from './core/businesses'
import { PREHISTORIA } from './core/data/prehistoria'
import { BusinessList } from './ui/components/BusinessList/BusinessList'
import { ResourceDisplay } from './ui/components/ResourceDisplay/ResourceDisplay'
import { GameProvider } from './ui/GameProvider'
import { useGame } from './ui/hooks/useGame'

function GameScreen() {
  const { state, setState } = useGame()

  const rows = PREHISTORIA.map((business) => {
    const level = businessLevel(state, business.id)
    const cost = levelCost(business, level)
    return {
      id: business.id,
      name: business.name,
      level,
      cost,
      canAfford: state.currency >= cost,
    }
  })

  const handlePurchase = (businessId: string) => {
    const business = PREHISTORIA.find((candidate) => candidate.id === businessId)
    if (business) {
      setState((previous) => purchaseLevel(previous, business))
    }
  }

  return (
    <div className="game-card">
      <ResourceDisplay amount={state.currency} />
      <p className="currency-label">Sustento</p>
      <BusinessList businesses={rows} onPurchase={handlePurchase} />
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
