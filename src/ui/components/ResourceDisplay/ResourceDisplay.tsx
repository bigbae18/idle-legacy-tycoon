import { formatNumber } from '../../../core/numbers'

interface ResourceDisplayProps {
  amount: number
  /** Nombre accesible del recurso (p. ej. "Sustento") para lectores y tests. */
  label?: string
}

export function ResourceDisplay({ amount, label }: ResourceDisplayProps) {
  return (
    <p className="resource-display" aria-label={label}>
      {formatNumber(amount)}
    </p>
  )
}
