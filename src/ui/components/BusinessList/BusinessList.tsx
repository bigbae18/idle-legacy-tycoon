import { formatNumber } from '../../../core/numbers'

export interface BusinessRow {
  id: string
  name: string
  level: number
  cost: number
  canAfford: boolean
}

interface BusinessListProps {
  businesses: BusinessRow[]
  onPurchase: (businessId: string) => void
}

/** Lista presentacional de negocios de la era. En R0 sin ciclos ni hitos (llegan en R1). */
export function BusinessList({ businesses, onPurchase }: BusinessListProps) {
  return (
    <ul className="business-list">
      {businesses.map((business) => (
        <li key={business.id} className="business-row">
          <div className="business-info">
            <span className="business-name">{business.name}</span>
            <span className="business-level">Nv. {business.level}</span>
          </div>
          <button
            className="buy-button"
            onClick={() => onPurchase(business.id)}
            disabled={!business.canAfford}
          >
            Comprar ({formatNumber(business.cost)})
          </button>
        </li>
      ))}
    </ul>
  )
}
