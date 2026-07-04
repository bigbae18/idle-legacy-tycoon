import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResourceDisplay } from './ResourceDisplay'

describe('ResourceDisplay', () => {
  it('renderiza el número recibido', () => {
    render(<ResourceDisplay amount={42} />)

    expect(screen.getByText('42')).toBeInTheDocument()
  })
})
