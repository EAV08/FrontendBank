import type { CampoError } from './tipos'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  readonly estado: number
  readonly errores: CampoError[]

  constructor(estado: number, mensaje: string, errores: CampoError[] = []) {
    super(mensaje)
    this.name = 'ApiError'
    this.estado = estado
    this.errores = errores
  }

  mensajeDelCampo(campo: string): string | undefined {
    return this.errores.find((error) => error.campo === campo)?.mensaje
  }
}

export function comoApiError(causa: unknown): ApiError {
  return causa instanceof ApiError ? causa : new ApiError(0, 'Ocurrió un error inesperado. Intente de nuevo.')
}

let alSesionVencida: (() => void) | null = null

export function registrarSesionVencida(accion: (() => void) | null): void {
  alSesionVencida = accion
}

interface Opciones {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH'
  cuerpo?: unknown
  token?: string | null
}

function interpretar(texto: string): unknown {
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}

function mensajeDe(datos: unknown, estado: number): string {
  if (datos && typeof datos === 'object' && 'mensaje' in datos && typeof datos.mensaje === 'string') {
    return datos.mensaje
  }
  if (estado === 502 || estado === 503 || estado === 504) {
    return 'El servicio no está disponible en este momento. Intente más tarde.'
  }
  return `Ocurrió un error inesperado (código ${estado}).`
}

function erroresDe(datos: unknown): CampoError[] {
  if (datos && typeof datos === 'object' && 'errores' in datos && Array.isArray(datos.errores)) {
    return datos.errores.filter(
      (error): error is CampoError =>
        !!error && typeof error.campo === 'string' && typeof error.mensaje === 'string',
    )
  }
  return []
}

export async function solicitar<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const { metodo = 'POST', cuerpo, token } = opciones
  const encabezados: Record<string, string> = {}
  if (cuerpo !== undefined) {
    encabezados['Content-Type'] = 'application/json'
  }
  if (token) {
    encabezados['Authorization'] = `Bearer ${token}`
  }

  let respuesta: Response
  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      headers: encabezados,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No fue posible comunicarse con el servidor. Intente más tarde.')
  }

  const texto = await respuesta.text()
  const datos = texto ? interpretar(texto) : null
  if (respuesta.ok) {
    return datos as T
  }
  if (respuesta.status === 401 && token) {
    alSesionVencida?.()
  }
  throw new ApiError(respuesta.status, mensajeDe(datos, respuesta.status), erroresDe(datos))
}
