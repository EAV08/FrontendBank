
export type Rol = 'CLIENTE' | 'ADMINISTRADOR'

export interface CampoError {
  campo: string
  mensaje: string
}

export interface RegistroClienteRequest {
  nombreComercial: string
  razonSocial: string
  nitDocumento: string
  email: string
  usuario: string
  contrasena: string
  telefono?: string
}

export interface RegistroClienteResponse {
  idCliente: string
  estado: string
  mensaje: string
}

export interface IngresoRequest {
  usuario: string
  contrasena: string
}

export interface IngresoResponse {
  idCliente: string
  estado: string
  mensaje: string
  token: string
}

export interface ActualizarClienteRequest {
  nombreComercial: string
  razonSocial: string
  email: string
  telefono?: string
}

export interface ActualizarClienteResponse {
  idCliente: string
  estado: string
  nombreComercial: string
  razonSocial: string
  email: string
  telefono: string | null
  mensaje: string
}

export type EstadoCliente = 'activo' | 'inactivo'

export interface CambiarEstadoRequest {
  estado: EstadoCliente
  motivo: string
}

export interface CambiarEstadoResponse {
  idCliente: string
  estado: string
  motivo: string
  mensaje: string
}

export interface CuentaCreadaResponse {
  idCuenta: string
  numeroCuenta: string
  idCliente: string
  estado: string
  saldo: number
  mensaje: string
}

export interface SaldoDisponibleResponse {
  idCuenta: string
  numeroCuenta: string
  idCliente: string
  estado: string
  saldo: number
  mensaje: string
}

export type MotivoBloqueo = 'pérdida' | 'fraude'

export interface CuentaBloqueadaResponse {
  idCuenta: string
  numeroCuenta: string
  idCliente: string
  estado: string
  operacionesSuspendidas: boolean
  motivo: string
  mensaje: string
}

export interface EstadoCuentaRequest {
  usuario: string
  contrasena: string
  numeroCuenta: string
}

export interface EstadoCuentaResponse {
  numeroCuenta: string
  estado: string
  mensaje: string
}

export interface DepositoRequest {
  numeroCuenta: string
  monto: number
}

export interface ConfirmacionDepositoResponse {
  numeroCuenta: string
  nombrePropietario: string
  monto: number
  mensaje: string
}

export interface DepositoRealizadoResponse {
  idTransaccion: string
  numeroCuenta: string
  nombrePropietario: string
  monto: number
  saldo: number
  mensaje: string
}

export interface RetiroRequest {
  numeroCuenta: string
  monto: number
}

export interface RetiroRealizadoResponse {
  idRetiro: string
  numeroCuenta: string
  monto: number
  saldo: number
  mensaje: string
}
