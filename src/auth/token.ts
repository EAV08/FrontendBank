import type { Rol } from '../api/tipos'

export interface DatosToken {
  idCliente: string
  usuario: string
  rol: Rol
  expira: number
}

/**
 * Lee los datos del token (sub, usuario, rol, exp) SOLO para decidir qué mostrar.
 */
export function decodificarToken(token: string): DatosToken | null {
  const partes = token.split('.')
  if (partes.length !== 3) {
    return null
  }
  try {
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    const relleno = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const bytes = Uint8Array.from(atob(relleno), (caracter) => caracter.charCodeAt(0))
    const carga: unknown = JSON.parse(new TextDecoder().decode(bytes))
    if (!carga || typeof carga !== 'object') {
      return null
    }
    const { sub, usuario, rol, exp } = carga as Record<string, unknown>
    if (typeof sub !== 'string' || typeof exp !== 'number') {
      return null
    }
    return {
      idCliente: sub,
      usuario: typeof usuario === 'string' ? usuario : '',
      rol: rol === 'ADMINISTRADOR' ? 'ADMINISTRADOR' : 'CLIENTE',
      expira: exp * 1000,
    }
  } catch {
    return null
  }
}

export function haVencido(datos: DatosToken, ahora: number = Date.now()): boolean {
  return ahora >= datos.expira
}
