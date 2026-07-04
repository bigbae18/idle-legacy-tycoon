import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useGame } from './useGame'

function Consumer() {
  useGame()
  return null
}

describe('useGame', () => {
  it('lanza un error si se usa fuera de un GameProvider', () => {
    expect(() => render(<Consumer />)).toThrowError(/GameProvider/)
  })
})
