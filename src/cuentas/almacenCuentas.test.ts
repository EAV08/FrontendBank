import { describe, expect, it } from 'vitest'
import { actualizarSaldoPorNumero, guardarCuentas, guardarOActualizar, leerCuentas, olvidarCuenta, type CuentaLocal } from './almacenCuentas'

function almacenFalso(): Storage {
  const datos = new Map<string, string>()
  return {
    get length() { return datos.size },
    clear: () => datos.clear(),
    getItem: (k) => datos.get(k) ?? null,
    key: (i) => [...datos.keys()][i] ?? null,
    removeItem: (k) => void datos.delete(k),
    setItem: (k, v) => void datos.set(k, v),
  }
}
const cuenta = (n: string): CuentaLocal => ({ idCuenta: `id-${n}`, numeroCuenta: n, estado: 'activo' })

describe('almacén de cuentas', () => {
  it('guarda y lee por cliente', () => {
    const a = almacenFalso()
    guardarCuentas('c1', [cuenta('1')], a)
    expect(leerCuentas('c1', a)).toEqual([cuenta('1')])
    expect(leerCuentas('c2', a)).toEqual([])
  })
  it('ignora datos corruptos', () => {
    const a = almacenFalso()
    a.setItem('bb.cuentas.c1', '{no es json')
    expect(leerCuentas('c1', a)).toEqual([])
    a.setItem('bb.cuentas.c1', JSON.stringify([cuenta('1'), { x: 1 }]))
    expect(leerCuentas('c1', a)).toEqual([cuenta('1')])
  })
  it('agrega, reemplaza, actualiza saldo y olvida', () => {
    let lista = guardarOActualizar([], cuenta('1'))
    lista = guardarOActualizar(lista, { ...cuenta('1'), estado: 'bloqueado' })
    expect(lista).toHaveLength(1)
    expect(lista[0].estado).toBe('bloqueado')
    lista = actualizarSaldoPorNumero(lista, '1', 50)
    expect(lista[0].saldo).toBe(50)
    expect(olvidarCuenta(lista, 'id-1')).toEqual([])
  })
})
