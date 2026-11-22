import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { registrarSesionVencida } from '../api/cliente'
import { ContextoSesion, type Sesion } from './contexto'
import { decodificarToken, haVencido } from './token'

const CLAVE = 'bb.token'
const AVISO_VENCIDA = 'Su sesión venció. Ingrese de nuevo.'

function leerSesionGuardada(): Sesion | null {
  try {
    const token = sessionStorage.getItem(CLAVE)
    if (!token) {
      return null
    }
    const datos = decodificarToken(token)
    if (!datos || haVencido(datos)) {
      sessionStorage.removeItem(CLAVE)
      return null
    }
    return { ...datos, token }
  } catch {
    return null
  }
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesionGuardada)
  const [aviso, setAviso] = useState<string | null>(null)

  const cerrarSesion = useCallback((mensaje?: string) => {
    try {
      sessionStorage.removeItem(CLAVE)
    } catch {
      
    }
    setSesion(null)
    setAviso(mensaje ?? null)
  }, [])

  const iniciarSesion = useCallback((token: string) => {
    const datos = decodificarToken(token)
    if (!datos || haVencido(datos)) {
      return false
    }
    try {
      sessionStorage.setItem(CLAVE, token)
    } catch {
      
    }
    setSesion({ ...datos, token })
    setAviso(null)
    return true
  }, [])

  const limpiarAviso = useCallback(() => setAviso(null), [])

  useEffect(() => {
    registrarSesionVencida(() => cerrarSesion(AVISO_VENCIDA))
    return () => registrarSesionVencida(null)
  }, [cerrarSesion])

  useEffect(() => {
    if (!sesion) {
      return
    }
    const espera = Math.max(sesion.expira - Date.now(), 0)
    const temporizador = setTimeout(() => cerrarSesion(AVISO_VENCIDA), espera)
    return () => clearTimeout(temporizador)
  }, [sesion, cerrarSesion])

  const valor = useMemo(
    () => ({ sesion, aviso, iniciarSesion, cerrarSesion, limpiarAviso }),
    [sesion, aviso, iniciarSesion, cerrarSesion, limpiarAviso],
  )

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
}
