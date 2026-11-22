import { describe, expect, it } from 'vitest'
import { esUuid, interpretarMonto } from './validacion'

describe('interpretarMonto', () => {
  it.each([['10', 10], ['10.5', 10.5], [' 7,25 ', 7.25], ['0.01', 0.01]])('acepta %s', (texto, esperado) => {
    expect(interpretarMonto(texto)).toBe(esperado)
  })
  it.each(['', '0', '-5', '1.234', 'abc', '1e3', '1.', '1234567890123'])('rechaza "%s"', (texto) => {
    expect(interpretarMonto(texto)).toBeNull()
  })
})

describe('esUuid', () => {
  it('valida el formato', () => {
    expect(esUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    expect(esUuid('123')).toBe(false)
  })
})
