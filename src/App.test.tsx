import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { save } from './persistence/save'
import { STORAGE_KEY } from './persistence/schema'
import { localStorageAdapter } from './persistence/storageAdapter'

/** Siembra un save v3 con bayas al nivel dado y el resto de negocios a 0. */
function seedSave(currency: number, bayasLevel = 1, cycleElapsedMs: number | null = null, savedAt = Date.now()) {
  save(
    { currency, businesses: { bayas: { level: bayasLevel, cycleElapsedMs } } },
    localStorageAdapter,
    savedAt,
  )
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

  it('renderiza los 5 negocios de la Prehistoria', () => {
    render(<App />)

    expect(screen.getByText('Recolección de bayas')).toBeInTheDocument()
    expect(screen.getByText('Hoguera')).toBeInTheDocument()
    expect(screen.getByText('Caza mayor')).toBeInTheDocument()
    expect(screen.getByText('Taller de sílex')).toBeInTheDocument()
    expect(screen.getByText('Pinturas rupestres')).toBeInTheDocument()
  })

  it('tap: el ciclo de bayas cobra al completarse y el negocio vuelve a reposo', () => {
    vi.useFakeTimers()
    render(<App />)
    const tapButton = screen.getByRole('button', { name: 'Recolectar Recolección de bayas' })

    fireEvent.click(tapButton)
    expect(tapButton).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByLabelText('Sustento')).toHaveTextContent('1')
    expect(tapButton).toBeEnabled()
  })

  it('sin tap no se produce nada (la producción continua de R0 ya no existe)', () => {
    vi.useFakeTimers()
    render(<App />)

    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    expect(screen.getByLabelText('Sustento')).toHaveTextContent('0')
  })

  it('compra ×1: descuenta el coste y sube un nivel', () => {
    seedSave(100)
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Comprar Recolección de bayas' }))

    expect(screen.getByText('Nv. 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Sustento')).toHaveTextContent('95')
  })

  it('compra ×10: sube 10 niveles de golpe', () => {
    seedSave(10_000)
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '×10' }))
    fireEvent.click(screen.getByRole('button', { name: 'Comprar Recolección de bayas' }))

    expect(screen.getByText('Nv. 11')).toBeInTheDocument()
  })

  it('compra ×máx: compra todos los niveles que alcancen los fondos', () => {
    // desde nivel 1, los costes son 5+5+6 = 16; el 4º nivel (6) ya no entra con 21
    seedSave(21)
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '×Máx' }))
    fireEvent.click(screen.getByRole('button', { name: 'Comprar Recolección de bayas' }))

    expect(screen.getByText('Nv. 4')).toBeInTheDocument()
    expect(screen.getByLabelText('Sustento')).toHaveTextContent('5')
  })

  it('al volver con un ciclo lanzado que completó fuera, muestra el modal de retorno con el desglose', () => {
    // bayas nivel 5 con ciclo lanzado hace 1 minuto: completó fuera → +5
    seedSave(100, 5, 0, Date.now() - 60_000)
    render(<App />)

    const modal = screen.getByRole('dialog', { name: 'Ganancias offline' })
    expect(within(modal).getByText(/Mientras no estabas/)).toBeInTheDocument()
    expect(within(modal).getByText(/\+5/)).toBeInTheDocument()
    expect(within(modal).getByText(/en 1m/)).toBeInTheDocument()
    expect(screen.getByLabelText('Sustento')).toHaveTextContent('105')

    fireEvent.click(screen.getByRole('button', { name: 'Recoger' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Sustento')).toHaveTextContent('105')
  })

  it('al volver sin ciclos lanzados no hay modal (solo aparece con cobro)', () => {
    seedSave(100, 5, null, Date.now() - 60_000)
    render(<App />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('reiniciar partida: tras confirmar, borra el save y vuelve al estado inicial', () => {
    seedSave(123, 7)
    render(<App />)
    expect(screen.getByLabelText('Sustento')).toHaveTextContent('123')

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar partida' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sí, borrar todo' }))

    expect(screen.getByLabelText('Sustento')).toHaveTextContent('0')
    expect(screen.getByText('Nv. 1')).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
