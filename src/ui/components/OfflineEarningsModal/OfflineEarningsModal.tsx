import { formatDuration, formatNumber } from '../../../core/numbers'

interface OfflineEarningsModalProps {
  earned: number
  elapsedMs: number
  onClose: () => void
}

/**
 * Modal de retorno (GDD §7): desglose de lo cobrado mientras no estabas. Es también
 * el hueco natural del rewarded ×2 (R9): su botón se sumará junto a "Recoger" usando
 * el mismo `earned` como base.
 */
export function OfflineEarningsModal({ earned, elapsedMs, onClose }: OfflineEarningsModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Ganancias offline">
        <h2 className="modal-title">Mientras no estabas…</h2>
        <p className="modal-earnings">+{formatNumber(earned)} Sustento</p>
        <p className="modal-detail">en {formatDuration(elapsedMs)}</p>
        <button className="modal-collect" onClick={onClose}>
          Recoger
        </button>
      </div>
    </div>
  )
}
