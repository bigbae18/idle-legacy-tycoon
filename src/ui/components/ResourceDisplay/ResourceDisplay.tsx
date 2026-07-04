import { formatNumber } from '../../../core/numbers'

interface ResourceDisplayProps {
  amount: number
}

export function ResourceDisplay({ amount }: ResourceDisplayProps) {
  return <p className="resource-display">{formatNumber(amount)}</p>
}
