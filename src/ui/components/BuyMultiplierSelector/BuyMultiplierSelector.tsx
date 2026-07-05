export type BuyMultiplier = 1 | 10 | 'max'

interface BuyMultiplierSelectorProps {
  value: BuyMultiplier
  onChange: (multiplier: BuyMultiplier) => void
}

const OPTIONS: Array<{ value: BuyMultiplier; label: string }> = [
  { value: 1, label: '×1' },
  { value: 10, label: '×10' },
  { value: 'max', label: '×Máx' },
]

/**
 * Selector global del lote de compra (GDD §3). En R1 va sin gating: el desbloqueo
 * por Renombre 3 (GDD §4) se aplicará cuando exista el Renombre (R3).
 */
export function BuyMultiplierSelector({ value, onChange }: BuyMultiplierSelectorProps) {
  return (
    <div className="multiplier-selector" role="group" aria-label="Lote de compra">
      {OPTIONS.map((option) => (
        <button
          key={option.label}
          className="multiplier-option"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
