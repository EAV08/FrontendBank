import { createContext, useContext } from 'react'
import type { DatosToken } from './token'

export interface Sesion extends DatosToken {
  token: string
}

export interface ContextoSesionValor {
  sesion: Sesion | null
  /** Mensaje para mostrar en la pantalla de ingreso. */
  aviso: string | null
  iniciarSesion: (token: string) => boolean
  cerrarSesion: (aviso?: string) => void
  limpiarAviso: () => void
}

export const ContextoSesion = createContext<ContextoSesionValor | null>(null)

export function useSesion(): ContextoSesionValor {
  const valor = useContext(ContextoSesion)
  if (!valor) {
    throw new Error('useSesion debe usarse dentro de ProveedorSesion')
  }
  return valor
}
