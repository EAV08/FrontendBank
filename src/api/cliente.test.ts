import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, registrarSesionVencida, solicitar } from './cliente'

function responder(estado: number, cuerpo: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(cuerpo === null ? null : JSON.stringify(cuerpo), { status: estado })))
}

afterEach(() => {
  vi.unstubAllGlobals()
  registrarSesionVencida(null)
})

describe('solicitar', () => {
  it('envía JSON y el token Bearer', async () => {
    responder(200, { ok: true })
    await solicitar('/x', { cuerpo: { a: 1 }, token: 'T' })
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('/api/x')
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json', Authorization: 'Bearer T' })
    expect(init?.body).toBe('{"a":1}')
  })
  it('convierte errores del backend en ApiError con campos', async () => {
    responder(400, { mensaje: 'Datos inválidos', errores: [{ campo: 'email', mensaje: 'Formato incorrecto' }] })
    const error = await solicitar('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).estado).toBe(400)
    expect((error as ApiError).mensajeDelCampo('email')).toBe('Formato incorrecto')
  })
  it('avisa a la sesión cuando hay 401 con token, pero no sin token', async () => {
    const aviso = vi.fn()
    registrarSesionVencida(aviso)
    responder(401, { mensaje: 'no' })
    await solicitar('/x', { token: 'T' }).catch(() => undefined)
    expect(aviso).toHaveBeenCalledTimes(1)
    await solicitar('/x').catch(() => undefined)
    expect(aviso).toHaveBeenCalledTimes(1)
  })
  it('da mensaje claro si no hay red o el servicio cae', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fail')))
    await expect(solicitar('/x')).rejects.toMatchObject({ estado: 0 })
    responder(503, null)
    await expect(solicitar('/x')).rejects.toThrow(/no está disponible/)
  })
})
