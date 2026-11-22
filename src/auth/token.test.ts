import { describe, expect, it } from 'vitest'
import { decodificarToken, haVencido } from './token'

function crear(carga: object): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${b64({ alg: 'HS256' })}.${b64(carga)}.firma`
}

describe('decodificarToken', () => {
  it('lee id, usuario, rol y vencimiento', () => {
    const datos = decodificarToken(crear({ sub: 'abc', usuario: 'ana', rol: 'ADMINISTRADOR', exp: 2000 }))
    expect(datos).toEqual({ idCliente: 'abc', usuario: 'ana', rol: 'ADMINISTRADOR', expira: 2_000_000 })
  })
  it('asume CLIENTE si el rol no es conocido', () => {
    expect(decodificarToken(crear({ sub: 'a', exp: 1, rol: 'otro' }))?.rol).toBe('CLIENTE')
  })
  it('rechaza tokens mal formados', () => {
    expect(decodificarToken('basura')).toBeNull()
    expect(decodificarToken('a.b.c')).toBeNull()
    expect(decodificarToken(crear({ usuario: 'x' }))).toBeNull()
  })
  it('detecta vencimiento', () => {
    const datos = decodificarToken(crear({ sub: 'a', exp: 100 }))!
    expect(haVencido(datos, 99_999)).toBe(false)
    expect(haVencido(datos, 100_000)).toBe(true)
  })
})
