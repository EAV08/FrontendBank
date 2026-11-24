import { afterEach, describe, expect, it, vi } from 'vitest'
import { transferir } from './endpoints'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('transferir', () => {
  it('envía las dos cuentas y el monto con el token Bearer', async () => {
    const cuerpo = {
      idTransaccion: 'e2dd2b48-0000-4000-8000-000000000001',
      numeroCuentaOrigen: '4000000001',
      numeroCuentaDestino: '4000000002',
      monto: 7.25,
      saldoOrigen: 32.75,
      mensaje: 'transferencia exitosa',
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(cuerpo), { status: 200 })))

    const respuesta = await transferir(
      { numeroCuentaOrigen: '4000000001', numeroCuentaDestino: '4000000002', monto: 7.25 },
      'T',
    )

    expect(respuesta).toEqual(cuerpo)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('/api/cuentas/transferencia')
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json', Authorization: 'Bearer T' })
    expect(init?.body).toBe('{"numeroCuentaOrigen":"4000000001","numeroCuentaDestino":"4000000002","monto":7.25}')
  })
})
