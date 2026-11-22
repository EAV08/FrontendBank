import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { comoApiError, type ApiError } from '../api/cliente'
import { ingresar } from '../api/endpoints'
import { useSesion } from '../auth/contexto'
import { Alerta } from '../componentes/Alerta'
import { Campo } from '../componentes/Campo'
import { LIMITES } from '../utilidades/validacion'

export function Ingreso() {
  const { sesion, aviso, iniciarSesion, limpiarAviso } = useSesion()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/cuentas'
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  if (sesion) {
    return <Navigate to={destino} replace />
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    limpiarAviso()
    try {
      const respuesta = await ingresar({ usuario, contrasena })
      if (iniciarSesion(respuesta.token)) {
        navegar(destino, { replace: true })
      } else {
        setError(comoApiError(null))
      }
    } catch (causa) {
      setError(comoApiError(causa))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="tarjeta estrecha">
      <h1>Ingresar</h1>
      {aviso && <Alerta tipo="info">{aviso}</Alerta>}
      {error && <Alerta tipo="error">{error.message}</Alerta>}
      <form onSubmit={enviar} noValidate>
        <Campo etiqueta="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} maxLength={LIMITES.usuario} autoComplete="username" required error={error?.mensajeDelCampo('usuario')} />
        <Campo etiqueta="Contraseña" type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} maxLength={LIMITES.contrasena} autoComplete="current-password" required error={error?.mensajeDelCampo('contrasena')} />
        <button type="submit" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </section>
  )
}
