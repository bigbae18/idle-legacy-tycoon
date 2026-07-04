import { formatNumber } from '../../../core/numbers'

interface UpgradeListProps {
  level: number
  cost: number
  canAfford: boolean
  onPurchase: () => void
}

/** Mejora única por ahora; el nombre deja sitio para un catálogo real más adelante. */
export function UpgradeList({ level, cost, canAfford, onPurchase }: UpgradeListProps) {
  return (
    <div className="upgrade-panel">
      <p className="upgrade-level">Nivel: {level}</p>
      <button className="upgrade-button" onClick={onPurchase} disabled={!canAfford}>
        Mejorar (coste: {formatNumber(cost)})
      </button>
    </div>
  )
}
