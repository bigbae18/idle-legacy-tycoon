import { formatNumber } from '../../../core/numbers'
import type { MilestoneDefinition } from '../../../core/types'

export interface BusinessCardData {
  id: string
  name: string
  level: number
  /** Producción y duración a mostrar (para nivel 0, la vista previa del nivel 1). */
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

/** Card de negocio (GDD §8): nivel, barra de ciclo, tap, compra y marcador de hito. */
export function BusinessCard({ business, onTap, onPurchase }: BusinessCardProps) {
  const locked = business.level === 0
  const running = business.cycleProgress !== null
  const progressPercent = Math.round((business.cycleProgress ?? 0) * 100)

  return (
    <li className={`business-card${locked ? ' business-card--locked' : ''}`}>
      <div className="business-header">
        <span className="business-name">{business.name}</span>
        <span className="business-level">Nv. {business.level}</span>
      </div>
      <p className="business-yield">
        +{formatNumber(business.outputPerCycle)} · {formatCycleSeconds(business.cycleDurationMs)}
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
          ? `Próximo hito: Nv. ${business.nextMilestone.level} — ${milestoneLabel(business.nextMilestone)}`
          : 'Hitos completos'}
      </p>
    </li>
  )
}
