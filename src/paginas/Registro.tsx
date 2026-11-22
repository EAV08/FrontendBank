import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { comoApiError, type ApiError } from '../api/cliente'
import { registrar } from '../api/endpoints'
import { Alerta } from '../componentes/Alerta'
import { Campo } from '../componentes/Campo'
import { LIMITES } from '../utilidades/validacion'

const VACIO = { nombreComercial: '', razonSocial: '', nitDocumento: '', email: '', usuario: '', contrasena: '', telefono: '' }

export function Registro() {
  const [datos, setDatos] = useState(VACIO)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [exito, setExito] = useState<string | null>(null)

  const cambiar = (campo: keyof typeof VACIO) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDatos((previo) => ({ ...previo, [campo]: e.target.value }))

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const { telefono, ...resto } = datos
      const respuesta = await registrar({ ...resto, ...(telefono.trim() ? { telefono: telefono.trim() } : {}) })
      setExito(respuesta.mensaje)
      setDatos(VACIO)
    } catch (causa) {
      setError(comoApiError(causa))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="tarjeta estrecha">
      <h1>Crear cuenta de cliente</h1>
      {exito && (
        <Alerta tipo="exito">
          {exito} <Link to="/ingreso">Ir a ingresar</Link>
        </Alerta>
      )}
      {error && <Alerta tipo="error">{error.message}</Alerta>}
      <form onSubmit={enviar} noValidate>
        <Campo etiqueta="Nombre comercial" value={datos.nombreComercial} onChange={cambiar('nombreComercial')} maxLength={LIMITES.nombreComercial} required error={error?.mensajeDelCampo('nombreComercial')} />
        <Campo etiqueta="Razón social" value={datos.razonSocial} onChange={cambiar('razonSocial')} maxLength={LIMITES.razonSocial} required error={error?.mensajeDelCampo('razonSocial')} />
        <Campo etiqueta="NIT o documento" value={datos.nitDocumento} onChange={cambiar('nitDocumento')} maxLength={LIMITES.nitDocumento} required error={error?.mensajeDelCampo('nitDocumento')} />
        <Campo etiqueta="Correo electrónico" type="email" value={datos.email} onChange={cambiar('email')} maxLength={LIMITES.email} required error={error?.mensajeDelCampo('email')} />
        <Campo etiqueta="Teléfono (opcional)" type="tel" value={datos.telefono} onChange={cambiar('telefono')} maxLength={LIMITES.telefono} error={error?.mensajeDelCampo('telefono')} />
        <Campo etiqueta="Usuario" value={datos.usuario} onChange={cambiar('usuario')} maxLength={LIMITES.usuario} autoComplete="username" required error={error?.mensajeDelCampo('usuario')} />
        <Campo etiqueta="Contraseña" type="password" value={datos.contrasena} onChange={cambiar('contrasena')} maxLength={LIMITES.contrasena} autoComplete="new-password" required error={error?.mensajeDelCampo('contrasena')} />
        <button type="submit" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Registrarme'}
        </button>
      </form>
    </section>
  )
}
