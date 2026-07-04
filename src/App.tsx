import { ResourceDisplay } from './ui/components/ResourceDisplay/ResourceDisplay'
import { GameProvider } from './ui/GameProvider'
import { useGame } from './ui/hooks/useGame'

function GameScreen() {
  const { state } = useGame()
  return <ResourceDisplay amount={state.amount} />
}

function App() {
  return (
    <GameProvider initialState={{ amount: 0, rate: 1 }}>
      <main>
        <h1>Idle Legacy Tycoon</h1>
        <GameScreen />
      </main>
    </GameProvider>
  )
}

export default App
