import { useState, type FormEvent } from 'react'
import { comoApiError } from '../api/cliente'
import { confirmarDeposito, prepararDeposito, retirar, transferir } from '../api/endpoints'
import type { ConfirmacionDepositoResponse } from '../api/tipos'
import { useSesion } from '../auth/contexto'
import { Alerta } from '../componentes/Alerta'
import { Campo } from '../componentes/Campo'
import { actualizarSaldoPorNumero, guardarCuentas, leerCuentas } from '../cuentas/almacenCuentas'
import { formatearMonto } from '../utilidades/formato'
import { interpretarMonto, LIMITES } from '../utilidades/validacion'

type Mensaje = { tipo: 'error' | 'exito'; texto: string } | null

export function Operaciones() {
  const { sesion } = useSesion()
  const { token, idCliente } = sesion!

  function recordarSaldo(numeroCuenta: string, saldo: number) {
    guardarCuentas(idCliente, actualizarSaldoPorNumero(leerCuentas(idCliente), numeroCuenta, saldo))
  }

  return (
    <section>
      <h1>Depósitos, retiros y transferencias</h1>
      <div className="dos-columnas">
        <Deposito token={token} alSaldo={recordarSaldo} />
        <Retiro token={token} alSaldo={recordarSaldo} />
        <Transferencia token={token} idCliente={idCliente} alSaldo={recordarSaldo} />
      </div>
    </section>
  )
}

interface Props {
  token: string
  alSaldo: (numeroCuenta: string, saldo: number) => void
}

interface PropsTransferencia extends Props {
  idCliente: string
}

function Deposito({ token, alSaldo }: Props) {
  const [numero, setNumero] = useState('')
  const [monto, setMonto] = useState('')
  const [pendiente, setPendiente] = useState<{ confirmacion: ConfirmacionDepositoResponse; monto: number } | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  async function preparar(e: FormEvent) {
    e.preventDefault()
    const valor = interpretarMonto(monto)
    if (!valor) {
      setMensaje({ tipo: 'error', texto: 'Ingrese un monto mayor que cero, con máximo dos decimales.' })
      return
    }
    setOcupado(true)
    setMensaje(null)
    try {
      const confirmacion = await prepararDeposito({ numeroCuenta: numero.trim(), monto: valor }, token)
      setPendiente({ confirmacion, monto: valor })
    } catch (causa) {
      setMensaje({ tipo: 'error', texto: comoApiError(causa).message })
    } finally {
      setOcupado(false)
    }
  }

  async function confirmar() {
    if (!pendiente) return
    setOcupado(true)
    try {
      const r = await confirmarDeposito({ numeroCuenta: pendiente.confirmacion.numeroCuenta, monto: pendiente.monto }, token)
      alSaldo(r.numeroCuenta, r.saldo)
      setMensaje({ tipo: 'exito', texto: `${r.mensaje} Nuevo saldo: ${formatearMonto(r.saldo)}.` })
      setPendiente(null)
      setMonto('')
    } catch (causa) {
      setMensaje({ tipo: 'error', texto: comoApiError(causa).message })
      setPendiente(null)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <form className="tarjeta" onSubmit={preparar} noValidate>
      <h2>Depositar</h2>
      {mensaje && <Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta>}
      {pendiente ? (
        <div className="confirmar">
          <p>
            {pendiente.confirmacion.mensaje}
            <br />
            Propietario: <strong>{pendiente.confirmacion.nombrePropietario}</strong>
            <br />
            Cuenta: <strong>{pendiente.confirmacion.numeroCuenta}</strong>
            <br />
            Monto: <strong>{formatearMonto(pendiente.monto)}</strong>
          </p>
          <button type="button" onClick={confirmar} disabled={ocupado}>
            Confirmar depósito
          </button>
          <button type="button" className="secundario" onClick={() => setPendiente(null)} disabled={ocupado}>
            Cancelar
          </button>
        </div>
      ) : (
        <>
          <Campo etiqueta="Número de cuenta destino" value={numero} onChange={(e) => setNumero(e.target.value)} maxLength={LIMITES.numeroCuenta} required />
          <Campo etiqueta="Monto" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} required />
          <button type="submit" disabled={ocupado}>
            Continuar
          </button>
        </>
      )}
    </form>
  )
}

function Retiro({ token, alSaldo }: Props) {
  const [numero, setNumero] = useState('')
  const [monto, setMonto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const valor = interpretarMonto(monto)
    if (!valor) {
      setMensaje({ tipo: 'error', texto: 'Ingrese un monto mayor que cero, con máximo dos decimales.' })
      return
    }
    setOcupado(true)
    setMensaje(null)
    try {
      const r = await retirar({ numeroCuenta: numero.trim(), monto: valor }, token)
      alSaldo(r.numeroCuenta, r.saldo)
      setMensaje({ tipo: 'exito', texto: `${r.mensaje} Nuevo saldo: ${formatearMonto(r.saldo)}.` })
      setMonto('')
    } catch (causa) {
      setMensaje({ tipo: 'error', texto: comoApiError(causa).message })
    } finally {
      setOcupado(false)
    }
  }

  return (
    <form className="tarjeta" onSubmit={enviar} noValidate>
      <h2>Retirar</h2>
      {mensaje && <Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta>}
      <Campo etiqueta="Número de cuenta" value={numero} onChange={(e) => setNumero(e.target.value)} maxLength={LIMITES.numeroCuenta} required />
      <Campo etiqueta="Monto" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} required />
      <button type="submit" disabled={ocupado}>
        Retirar
      </button>
    </form>
  )
}

function Transferencia({ token, idCliente, alSaldo }: PropsTransferencia) {
  const [origen, setOrigen] = useState('')
  const [destino, setDestino] = useState('')
  const [monto, setMonto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const valor = interpretarMonto(monto)
    if (!valor) {
      setMensaje({ tipo: 'error', texto: 'Ingrese un monto mayor que cero, con máximo dos decimales.' })
      return
    }
    if (origen.trim() === destino.trim()) {
      setMensaje({ tipo: 'error', texto: 'La cuenta destino debe ser diferente de la cuenta origen.' })
      return
    }
    setOcupado(true)
    setMensaje(null)
    const cuentas = leerCuentas(idCliente)
    try {
      const r = await transferir(
        { numeroCuentaOrigen: origen.trim(), numeroCuentaDestino: destino.trim(), monto: valor },
        token,
      )
      alSaldo(r.numeroCuentaOrigen, r.saldoOrigen)
      const destinoLocal = cuentas.find((cuenta) => cuenta.numeroCuenta === r.numeroCuentaDestino)
      if (destinoLocal?.saldo !== undefined) {
        alSaldo(r.numeroCuentaDestino, destinoLocal.saldo + r.monto)
      }
      setMensaje({ tipo: 'exito', texto: `${r.mensaje} Nuevo saldo de la cuenta origen: ${formatearMonto(r.saldoOrigen)}.` })
      setMonto('')
    } catch (causa) {
      setMensaje({ tipo: 'error', texto: comoApiError(causa).message })
    } finally {
      setOcupado(false)
    }
  }

  return (
    <form className="tarjeta" onSubmit={enviar} noValidate>
      <h2>Transferir</h2>
      {mensaje && <Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta>}
      <Campo etiqueta="Cuenta origen (propia)" value={origen} onChange={(e) => setOrigen(e.target.value)} maxLength={LIMITES.numeroCuenta} required />
      <Campo etiqueta="Cuenta destino" value={destino} onChange={(e) => setDestino(e.target.value)} maxLength={LIMITES.numeroCuenta} required />
      <Campo etiqueta="Monto" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} required />
      <button type="submit" disabled={ocupado}>
        Transferir
      </button>
    </form>
  )
}
