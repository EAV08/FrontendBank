import { solicitar } from './cliente'
import type {
  ActualizarClienteRequest,
  ActualizarClienteResponse,
  CambiarEstadoRequest,
  CambiarEstadoResponse,
  ConfirmacionDepositoResponse,
  CuentaBloqueadaResponse,
  CuentaCreadaResponse,
  DepositoRealizadoResponse,
  DepositoRequest,
  EstadoCuentaRequest,
  EstadoCuentaResponse,
  IngresoRequest,
  IngresoResponse,
  MotivoBloqueo,
  RegistroClienteRequest,
  RegistroClienteResponse,
  RetiroRealizadoResponse,
  RetiroRequest,
  SaldoDisponibleResponse,
} from './tipos'

// ---- Clientes ----

export function registrar(datos: RegistroClienteRequest) {
  return solicitar<RegistroClienteResponse>('/clientes', { cuerpo: datos })
}

export function ingresar(datos: IngresoRequest) {
  return solicitar<IngresoResponse>('/clientes/ingreso', { cuerpo: datos })
}

// Solo administrador.
export function actualizarCliente(idCliente: string, datos: ActualizarClienteRequest, token: string) {
  return solicitar<ActualizarClienteResponse>(`/clientes/${idCliente}`, { metodo: 'PUT', cuerpo: datos, token })
}

// Solo administrador.
export function cambiarEstadoCliente(idCliente: string, datos: CambiarEstadoRequest, token: string) {
  return solicitar<CambiarEstadoResponse>(`/clientes/${idCliente}/estado`, { metodo: 'PATCH', cuerpo: datos, token })
}

// ---- Cuentas ----

export function crearCuenta(token: string) {
  return solicitar<CuentaCreadaResponse>('/cuentas', { token })
}

export function consultarSaldo(idCuenta: string, token: string) {
  return solicitar<SaldoDisponibleResponse>('/cuentas/saldo', { cuerpo: { idCuenta }, token })
}

export function bloquearCuenta(idCuenta: string, motivo: MotivoBloqueo, token: string) {
  return solicitar<CuentaBloqueadaResponse>('/cuentas/bloqueo', { cuerpo: { idCuenta, motivo }, token })
}

// Público: no usa token, pide usuario y contraseña.
export function consultarEstadoCuenta(datos: EstadoCuentaRequest) {
  return solicitar<EstadoCuentaResponse>('/cuentas/estado', { cuerpo: datos })
}

// ---- Depósitos y retiros ----

export function prepararDeposito(datos: DepositoRequest, token: string) {
  return solicitar<ConfirmacionDepositoResponse>('/cuentas/deposito', { cuerpo: datos, token })
}

export function confirmarDeposito(datos: DepositoRequest, token: string) {
  return solicitar<DepositoRealizadoResponse>('/cuentas/deposito/confirmacion', { cuerpo: datos, token })
}

export function retirar(datos: RetiroRequest, token: string) {
  return solicitar<RetiroRealizadoResponse>('/cuentas/retiro', { cuerpo: datos, token })
}
