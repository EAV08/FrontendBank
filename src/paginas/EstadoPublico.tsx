import { useState, type FormEvent } from 'react'
import { comoApiError, type ApiError } from '../api/cliente'
import { consultarEstadoCuenta } from '../api/endpoints'
import type { EstadoCuentaResponse } from '../api/tipos'
import { Alerta } from '../componentes/Alerta'
import { Campo } from '../componentes/Campo'
import { LIMITES } from '../utilidades/validacion'

export function EstadoPublico() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [numeroCuenta, setNumeroCuenta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [resultado, setResultado] = useState<EstadoCuentaResponse | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    setResultado(null)
    try {
      setResultado(await consultarEstadoCuenta({ usuario, contrasena, numeroCuenta: numeroCuenta.trim() }))
    } catch (causa) {
      setError(comoApiError(causa))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="tarjeta estrecha">
      <h1>Estado de una cuenta</h1>
      <p className="ayuda">Consulta pública: se piden sus credenciales y el número de cuenta.</p>
      {error && <Alerta tipo="error">{error.message}</Alerta>}
      {resultado && (
        <Alerta tipo="exito">
          Cuenta {resultado.numeroCuenta}: <strong>{resultado.estado}</strong>. {resultado.mensaje}
        </Alerta>
      )}
      <form onSubmit={enviar} noValidate>
        <Campo etiqueta="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} maxLength={LIMITES.usuario} required error={error?.mensajeDelCampo('usuario')} />
        <Campo etiqueta="Contraseña" type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} maxLength={LIMITES.contrasena} required error={error?.mensajeDelCampo('contrasena')} />
        <Campo etiqueta="Número de cuenta" value={numeroCuenta} onChange={(e) => setNumeroCuenta(e.target.value)} maxLength={LIMITES.numeroCuenta} required error={error?.mensajeDelCampo('numeroCuenta')} />
        <button type="submit" disabled={enviando}>
          {enviando ? 'Consultando…' : 'Consultar'}
        </button>
      </form>
    </section>
  )
}
