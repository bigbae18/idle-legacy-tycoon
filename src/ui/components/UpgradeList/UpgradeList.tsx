interface UpgradeListProps {
  level: number
  cost: number
  canAfford: boolean
  onPurchase: () => void
}

/** Mejora única por ahora; el nombre deja sitio para un catálogo real más adelante. */
export function UpgradeList({ level, cost, canAfford, onPurchase }: UpgradeListProps) {
  return (
    <div>
      <p>Nivel: {level}</p>
      <button onClick={onPurchase} disabled={!canAfford}>
        Mejorar (coste: {cost})
      </button>
    </div>
  )
}
