import { useState } from 'react'

interface ResetButtonProps {
  onReset: () => void
}

/** Reinicio de partida con confirmación en dos pasos (pedido por el usuario tras R0). */
export function ResetButton({ onReset }: ResetButtonProps) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button className="reset-button" onClick={() => setConfirming(true)}>
        Reiniciar partida
      </button>
    )
  }

  return (
    <div className="reset-confirm">
      <p className="reset-warning">¿Borrar todo el progreso? No hay vuelta atrás.</p>
      <div className="reset-confirm-actions">
        <button
          className="reset-confirm-yes"
          onClick={() => {
            setConfirming(false)
            onReset()
          }}
        >
          Sí, borrar todo
        </button>
        <button className="reset-confirm-no" onClick={() => setConfirming(false)}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
