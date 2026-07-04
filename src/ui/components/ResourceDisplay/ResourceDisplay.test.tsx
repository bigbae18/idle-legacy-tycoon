import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResourceDisplay } from './ResourceDisplay'

describe('ResourceDisplay', () => {
  it('renderiza números pequeños tal cual', () => {
    render(<ResourceDisplay amount={42} />)

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('formatea números grandes con sufijo (K/M/B)', () => {
    render(<ResourceDisplay amount={1500} />)

    expect(screen.getByText('1.5K')).toBeInTheDocument()
  })
})
