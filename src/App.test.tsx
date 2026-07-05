import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { save } from './persistence/save'
import { STORAGE_KEY } from './persistence/schema'
import { localStorageAdapter } from './persistence/storageAdapter'
import type { BusinessState, GameState } from './core/types'

/** Siembra un save v4; por defecto solo recolectores con las unidades dadas y el resto a 0. */
function seedSave(
  currency: number,
  businesses: Record<string, BusinessState>,
  savedAt = Date.now(),
) {
  const state: GameState = { currency, businesses }
  save(state, localStorageAdapter, savedAt)
}

function idle(count: number): BusinessState {
  return { count, purchased: count, cycleElapsedMs: null }
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza el nombre del proyecto', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Idle Legacy Tycoon' })).toBeInTheDocument()
  })

  it('renderiza los 5 eslabones de la cadena de la Prehistoria', () => {
    render(<App />)

    expect(screen.getByText('Recolectores')).toBeInTheDocument()
    expect(screen.getByText('Hogueras')).toBeInTheDocument()
    expect(screen.getByText('Partidas de caza')).toBeInTheDocument()
    expect(screen.getByText('Talleres de sílex')).toBeInTheDocument()
    expect(screen.getByText('Pinturas rupestres')).toBeInTheDocument()
  })

  it('tap: el ciclo de recolectores cobra Bayas al completarse y vuelve a reposo', () => {
    vi.useFakeTimers()
    render(<App />)
    const tapButton = screen.getByRole('button', { name: 'Recolectar Recolectores' })

    fireEvent.click(tapButton)
    expect(tapButton).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByLabelText('Bayas')).toHaveTextContent('1')
    expect(tapButton).toBeEnabled()
  })

  it('cadena: el ciclo de Hogueras produce Recolectores, no Bayas', () => {
    vi.useFakeTimers()
    seedSave(0, { recolectores: idle(1), hoguera: idle(2) })
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Recolectar Hogueras' }))
    act(() => {
      vi.advanceTimersByTime(6000)
    })

    // +2 recolectores (1 → ×3); las Bayas no se mueven
    const recolectoresCard = screen
      .getByRole('button', { name: 'Recolectar Recolectores' })
      .closest('li') as HTMLElement
    expect(within(recolectoresCard).getByText('×3')).toBeInTheDocument()
    expect(screen.getByLabelText('Bayas')).toHaveTextContent('0')
  })

  it('sin tap no se produce nada', () => {
    vi.useFakeTimers()
    render(<App />)

    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    expect(screen.getByLabelText('Bayas')).toHaveTextContent('0')
  })

  it('compra ×1: descuenta el coste y suma una unidad', () => {
    seedSave(100, { recolectores: idle(1) })
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Comprar Recolectores' }))

    expect(screen.getByText('×2')).toBeInTheDocument()
    expect(screen.getByLabelText('Bayas')).toHaveTextContent('95')
  })

  it('compra ×10: suma 10 unidades de golpe', () => {
    seedSave(10_000, { recolectores: idle(1) })
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '×10' }))
    fireEvent.click(screen.getByRole('button', { name: 'Comprar Recolectores' }))

    expect(screen.getByText('×11')).toBeInTheDocument()
  })

  it('compra ×máx: compra todas las unidades que alcancen los fondos', () => {
    // desde 1 comprada, los costes son 5+5+6 = 16; la 4ª (6) ya no entra con 21
    seedSave(21, { recolectores: idle(1) })
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '×Máx' }))
    fireEvent.click(screen.getByRole('button', { name: 'Comprar Recolectores' }))

    expect(screen.getByText('×4')).toBeInTheDocument()
    expect(screen.getByLabelText('Bayas')).toHaveTextContent('5')
  })

  it('al volver con un ciclo lanzado que completó fuera, muestra el modal de retorno con el desglose', () => {
    // 5 recolectores con ciclo lanzado hace 1 minuto: completó fuera → +5 Bayas
    seedSave(
      100,
      { recolectores: { count: 5, purchased: 5, cycleElapsedMs: 0 } },
      Date.now() - 60_000,
    )
    render(<App />)

    const modal = screen.getByRole('dialog', { name: 'Ganancias offline' })
    expect(within(modal).getByText(/Mientras no estabas/)).toBeInTheDocument()
    expect(within(modal).getByText(/\+5/)).toBeInTheDocument()
    expect(within(modal).getByText(/en 1m/)).toBeInTheDocument()
    expect(screen.getByLabelText('Bayas')).toHaveTextContent('105')

    fireEvent.click(screen.getByRole('button', { name: 'Recoger' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Bayas')).toHaveTextContent('105')
  })

  it('al volver sin ciclos lanzados no hay modal (solo aparece con cobro)', () => {
    seedSave(100, { recolectores: idle(5) }, Date.now() - 60_000)
    render(<App />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('reiniciar partida: tras confirmar, borra el save y vuelve al estado inicial', () => {
    seedSave(123, { recolectores: idle(7) })
    render(<App />)
    expect(screen.getByLabelText('Bayas')).toHaveTextContent('123')

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar partida' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sí, borrar todo' }))

    expect(screen.getByLabelText('Bayas')).toHaveTextContent('0')
    const recolectoresCard = screen
      .getByRole('button', { name: 'Recolectar Recolectores' })
      .closest('li') as HTMLElement
    expect(within(recolectoresCard).getByText('×1')).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
