import { useState, type FormEvent } from 'react'
import { ApiError, comoApiError } from '../api/cliente'
import { actualizarCliente, cambiarEstadoCliente } from '../api/endpoints'
import type { EstadoCliente } from '../api/tipos'
import { useSesion } from '../auth/contexto'
import { Alerta } from '../componentes/Alerta'
import { Campo } from '../componentes/Campo'
import { esUuid, LIMITES } from '../utilidades/validacion'

export function Admin() {
  const { sesion } = useSesion()
  const token = sesion!.token
  return (
    <section>
      <h1>Administración de clientes</h1>
      <div className="dos-columnas">
        <ActualizarDatos token={token} />
        <CambiarEstado token={token} />
      </div>
    </section>
  )
}

function ActualizarDatos({ token }: { token: string }) {
  const [id, setId] = useState('')
  const [datos, setDatos] = useState({ nombreComercial: '', razonSocial: '', email: '', telefono: '' })
  const [error, setError] = useState<ApiError | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const cambiar = (campo: keyof typeof datos) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDatos((previo) => ({ ...previo, [campo]: e.target.value }))

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setExito(null)
    if (!esUuid(id)) {
      setError(new ApiError(0, 'Identificador del cliente inválido.'))
      return
    }
    setOcupado(true)
    try {
      const { telefono, ...resto } = datos
      const r = await actualizarCliente(id.trim(), { ...resto, ...(telefono.trim() ? { telefono: telefono.trim() } : {}) }, token)
      setExito(r.mensaje)
    } catch (causa) {
      setError(comoApiError(causa))
    } finally {
      setOcupado(false)
    }
  }

  return (
    <form className="tarjeta" onSubmit={enviar} noValidate>
      <h2>Actualizar datos</h2>
      {exito && <Alerta tipo="exito">{exito}</Alerta>}
      {error && <Alerta tipo="error">{error.message}</Alerta>}
      <Campo etiqueta="Identificador del cliente (UUID)" value={id} onChange={(e) => setId(e.target.value)} required />
      <Campo etiqueta="Nombre comercial" value={datos.nombreComercial} onChange={cambiar('nombreComercial')} maxLength={LIMITES.nombreComercial} required error={error?.mensajeDelCampo('nombreComercial')} />
      <Campo etiqueta="Razón social" value={datos.razonSocial} onChange={cambiar('razonSocial')} maxLength={LIMITES.razonSocial} required error={error?.mensajeDelCampo('razonSocial')} />
      <Campo etiqueta="Correo electrónico" type="email" value={datos.email} onChange={cambiar('email')} maxLength={LIMITES.email} required error={error?.mensajeDelCampo('email')} />
      <Campo etiqueta="Teléfono (opcional)" value={datos.telefono} onChange={cambiar('telefono')} maxLength={LIMITES.telefono} error={error?.mensajeDelCampo('telefono')} />
      <button type="submit" disabled={ocupado}>
        Guardar cambios
      </button>
    </form>
  )
}

function CambiarEstado({ token }: { token: string }) {
  const [id, setId] = useState('')
  const [estado, setEstado] = useState<EstadoCliente>('inactivo')
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setExito(null)
    if (!esUuid(id)) {
      setError('Identificador del cliente inválido.')
      return
    }
    setOcupado(true)
    try {
      const r = await cambiarEstadoCliente(id.trim(), { estado, motivo: motivo.trim() }, token)
      setExito(r.mensaje)
    } catch (causa) {
      setError(comoApiError(causa).message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <form className="tarjeta" onSubmit={enviar} noValidate>
      <h2>Cambiar estado</h2>
      {exito && <Alerta tipo="exito">{exito}</Alerta>}
      {error && <Alerta tipo="error">{error}</Alerta>}
      <Campo etiqueta="Identificador del cliente (UUID)" value={id} onChange={(e) => setId(e.target.value)} required />
      <div className="campo">
        <label htmlFor="estado-cliente">Nuevo estado</label>
        <select id="estado-cliente" value={estado} onChange={(e) => setEstado(e.target.value as EstadoCliente)}>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
      <Campo etiqueta="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={LIMITES.motivo} required />
      <button type="submit" disabled={ocupado}>
        Cambiar estado
      </button>
    </form>
  )
}
