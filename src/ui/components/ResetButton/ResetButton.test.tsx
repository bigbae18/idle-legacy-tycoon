import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ResetButton } from './ResetButton'

describe('ResetButton', () => {
  it('de inicio solo muestra el botón, sin confirmación', () => {
    render(<ResetButton onReset={() => {}} />)

    expect(screen.getByRole('button', { name: 'Reiniciar partida' })).toBeInTheDocument()
    expect(screen.queryByText(/¿Borrar todo el progreso\?/)).not.toBeInTheDocument()
  })

  it('pide confirmación antes de reiniciar (no reinicia al primer clic)', () => {
    const onReset = vi.fn()
    render(<ResetButton onReset={onReset} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar partida' }))

    expect(screen.getByText(/¿Borrar todo el progreso\?/)).toBeInTheDocument()
    expect(onReset).not.toHaveBeenCalled()
  })

  it('cancelar vuelve atrás sin reiniciar', () => {
    const onReset = vi.fn()
    render(<ResetButton onReset={onReset} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar partida' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onReset).not.toHaveBeenCalled()
    expect(screen.queryByText(/¿Borrar todo el progreso\?/)).not.toBeInTheDocument()
  })

  it('confirmar reinicia una sola vez y cierra la confirmación', () => {
    const onReset = vi.fn()
    render(<ResetButton onReset={onReset} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar partida' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sí, borrar todo' }))

    expect(onReset).toHaveBeenCalledOnce()
    expect(screen.queryByText(/¿Borrar todo el progreso\?/)).not.toBeInTheDocument()
  })
})
