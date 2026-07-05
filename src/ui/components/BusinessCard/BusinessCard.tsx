import { formatNumber } from '../../../core/numbers'
import type { MilestoneDefinition } from '../../../core/types'

export interface BusinessCardData {
  id: string
  name: string
  /** Unidades totales poseídas (compradas + producidas por la cascada). */
  owned: number
  /** Qué produce este eslabón: "Bayas" (primer negocio) o el nombre del anterior. */
  producesLabel: string
  /** Producción y duración a mostrar (para 0 unidades, la vista previa de la primera). */
  outputPerCycle: number
  cycleDurationMs: number
  /** Progreso 0..1 del ciclo en curso; null = en reposo. */
  cycleProgress: number | null
  nextMilestone: MilestoneDefinition | null
  purchase: { count: number; cost: number; canAfford: boolean }
}

interface BusinessCardProps {
  business: BusinessCardData
  onTap: (businessId: string) => void
  onPurchase: (businessId: string) => void
}

function formatCycleSeconds(ms: number): string {
  const seconds = ms / 1000
  return `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)}s`
}

function milestoneLabel(milestone: MilestoneDefinition): string {
  return milestone.effect === 'production'
    ? `producción ×${milestone.multiplier}`
    : `ciclo ×${milestone.multiplier} más rápido`
}

/** Card de un eslabón de la cadena (GDD §3/§8): unidades, barra de ciclo, tap, compra e hito. */
export function BusinessCard({ business, onTap, onPurchase }: BusinessCardProps) {
  const locked = business.owned === 0
  const running = business.cycleProgress !== null
  const progressPercent = Math.round((business.cycleProgress ?? 0) * 100)

  return (
    <li className={`business-card${locked ? ' business-card--locked' : ''}`}>
      <div className="business-header">
        <span className="business-name">{business.name}</span>
        <span className="business-count">×{formatNumber(business.owned)}</span>
      </div>
      <p className="business-yield">
        +{formatNumber(business.outputPerCycle)} {business.producesLabel} ·{' '}
        {formatCycleSeconds(business.cycleDurationMs)}
      </p>
      <div
        className="cycle-bar"
        role="progressbar"
        aria-label={`Ciclo de ${business.name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercent}
      >
        <div className="cycle-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="business-actions">
        {locked ? (
          <span className="business-locked">Bloqueado</span>
        ) : (
          <button
            className="tap-button"
            aria-label={`Recolectar ${business.name}`}
            onClick={() => onTap(business.id)}
            disabled={running}
          >
            {running ? 'En marcha…' : 'Recolectar'}
          </button>
        )}
        <button
          className="buy-button"
          aria-label={`Comprar ${business.name}`}
          onClick={() => onPurchase(business.id)}
          disabled={!business.purchase.canAfford}
        >
          {locked ? 'Desbloquear' : `Comprar ×${business.purchase.count}`} —{' '}
          {formatNumber(business.purchase.cost)}
        </button>
      </div>
      <p className="business-milestone">
        {business.nextMilestone
          ? `Próximo hito: ${formatNumber(business.nextMilestone.count)} uds. — ${milestoneLabel(business.nextMilestone)}`
          : 'Hitos completos'}
      </p>
    </li>
  )
}
