import { useEffect, useState, type FormEvent } from 'react'
import { comoApiError } from '../api/cliente'
import { bloquearCuenta, consultarSaldo, crearCuenta } from '../api/endpoints'
import type { MotivoBloqueo } from '../api/tipos'
import { useSesion } from '../auth/contexto'
import { Alerta } from '../componentes/Alerta'
import { Campo } from '../componentes/Campo'
import {
  guardarCuentas,
  guardarOActualizar,
  leerCuentas,
  olvidarCuenta,
  type CuentaLocal,
} from '../cuentas/almacenCuentas'
import { formatearFechaHora, formatearMonto } from '../utilidades/formato'
import { esUuid } from '../utilidades/validacion'

type Mensaje = { tipo: 'error' | 'exito'; texto: string } | null

export function Cuentas() {
  const { sesion } = useSesion()
  const idCliente = sesion!.idCliente
  const token = sesion!.token
  const [cuentas, setCuentas] = useState<CuentaLocal[]>(() => leerCuentas(idCliente))
  const [mensaje, setMensaje] = useState<Mensaje>(null)
  const [ocupado, setOcupado] = useState(false)
  const [idVincular, setIdVincular] = useState('')
  const [bloqueando, setBloqueando] = useState<string | null>(null)
  const [motivo, setMotivo] = useState<MotivoBloqueo>('pérdida')

  useEffect(() => guardarCuentas(idCliente, cuentas), [idCliente, cuentas])

  async function ejecutar(accion: () => Promise<string>) {
    setOcupado(true)
    setMensaje(null)
    try {
      setMensaje({ tipo: 'exito', texto: await accion() })
    } catch (causa) {
      setMensaje({ tipo: 'error', texto: comoApiError(causa).message })
    } finally {
      setOcupado(false)
    }
  }

  const crear = () =>
    ejecutar(async () => {
      const r = await crearCuenta(token)
      setCuentas((lista) =>
        guardarOActualizar(lista, { idCuenta: r.idCuenta, numeroCuenta: r.numeroCuenta, estado: r.estado, saldo: r.saldo, actualizada: Date.now() }),
      )
      return `${r.mensaje} Número de cuenta: ${r.numeroCuenta}`
    })

  const actualizarSaldo = (idCuenta: string) =>
    ejecutar(async () => {
      const r = await consultarSaldo(idCuenta, token)
      setCuentas((lista) =>
        guardarOActualizar(lista, { idCuenta: r.idCuenta, numeroCuenta: r.numeroCuenta, estado: r.estado, saldo: r.saldo, actualizada: Date.now() }),
      )
      return r.mensaje
    })

  function vincular(e: FormEvent) {
    e.preventDefault()
    const id = idVincular.trim()
    if (!esUuid(id)) {
      setMensaje({ tipo: 'error', texto: 'El identificador de la cuenta no tiene el formato correcto.' })
      return
    }
    void actualizarSaldo(id).then(() => setIdVincular(''))
  }

  const bloquear = (idCuenta: string) =>
    ejecutar(async () => {
      const r = await bloquearCuenta(idCuenta, motivo, token)
      setCuentas((lista) => lista.map((c) => (c.idCuenta === idCuenta ? { ...c, estado: r.estado } : c)))
      setBloqueando(null)
      return r.mensaje
    })

  return (
    <section>
      <h1>Mis cuentas</h1>
      <p className="ayuda">
        El servidor no entrega un listado de cuentas: aquí se muestran las que creó o vinculó desde este navegador.
      </p>
      {mensaje && <Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta>}
      <div className="barra">
        <button type="button" onClick={crear} disabled={ocupado}>
          Crear cuenta nueva
        </button>
      </div>

      {cuentas.length === 0 ? (
        <p>Aún no hay cuentas en este navegador.</p>
      ) : (
        <ul className="lista-cuentas">
          {cuentas.map((c) => (
            <li key={c.idCuenta} className="tarjeta">
              <div>
                <h2>{c.numeroCuenta}</h2>
                <p>
                  Estado: <strong>{c.estado}</strong>
                </p>
                <p>
                  Saldo: <strong>{c.saldo === undefined ? 'sin consultar' : formatearMonto(c.saldo)}</strong>
                  {c.actualizada && <small> (a las {formatearFechaHora(c.actualizada)})</small>}
                </p>
                <small className="id">ID: {c.idCuenta}</small>
              </div>
              <div className="acciones">
                <button type="button" onClick={() => actualizarSaldo(c.idCuenta)} disabled={ocupado}>
                  Consultar saldo
                </button>
                <button type="button" className="secundario" onClick={() => setBloqueando(bloqueando === c.idCuenta ? null : c.idCuenta)} disabled={ocupado}>
                  Bloquear
                </button>
                <button type="button" className="secundario" onClick={() => setCuentas((l) => olvidarCuenta(l, c.idCuenta))}>
                  Quitar de la lista
                </button>
              </div>
              {bloqueando === c.idCuenta && (
                <div className="confirmar">
                  <label htmlFor={`motivo-${c.idCuenta}`}>Motivo del bloqueo</label>
                  <select id={`motivo-${c.idCuenta}`} value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoBloqueo)}>
                    <option value="pérdida">Pérdida</option>
                    <option value="fraude">Fraude</option>
                  </select>
                  <button type="button" className="peligro" onClick={() => bloquear(c.idCuenta)} disabled={ocupado}>
                    Confirmar bloqueo
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form className="tarjeta" onSubmit={vincular} noValidate>
        <h2>Vincular una cuenta existente</h2>
        <Campo etiqueta="Identificador de la cuenta (UUID)" value={idVincular} onChange={(e) => setIdVincular(e.target.value)} />
        <button type="submit" disabled={ocupado}>
          Vincular y consultar
        </button>
      </form>
    </section>
  )
}
