
export interface CuentaLocal {
  idCuenta: string
  numeroCuenta: string
  estado: string
  saldo?: number
  actualizada?: number
}

const clave = (idCliente: string) => `bb.cuentas.${idCliente}`

function esCuentaLocal(valor: unknown): valor is CuentaLocal {
  if (!valor || typeof valor !== 'object') {
    return false
  }
  const { idCuenta, numeroCuenta, estado } = valor as Record<string, unknown>
  return typeof idCuenta === 'string' && typeof numeroCuenta === 'string' && typeof estado === 'string'
}

export function leerCuentas(idCliente: string, almacen: Storage = localStorage): CuentaLocal[] {
  try {
    const texto = almacen.getItem(clave(idCliente))
    const datos: unknown = texto ? JSON.parse(texto) : []
    return Array.isArray(datos) ? datos.filter(esCuentaLocal) : []
  } catch {
    return []
  }
}

export function guardarCuentas(idCliente: string, cuentas: CuentaLocal[], almacen: Storage = localStorage): void {
  try {
    almacen.setItem(clave(idCliente), JSON.stringify(cuentas))
  } catch {
  
  }
}

export function guardarOActualizar(lista: CuentaLocal[], cuenta: CuentaLocal): CuentaLocal[] {
  const existe = lista.some((item) => item.idCuenta === cuenta.idCuenta)
  return existe
    ? lista.map((item) => (item.idCuenta === cuenta.idCuenta ? { ...item, ...cuenta } : item))
    : [...lista, cuenta]
}

export function actualizarSaldoPorNumero(lista: CuentaLocal[], numeroCuenta: string, saldo: number): CuentaLocal[] {
  return lista.map((item) =>
    item.numeroCuenta === numeroCuenta ? { ...item, saldo, actualizada: Date.now() } : item,
  )
}

export function olvidarCuenta(lista: CuentaLocal[], idCuenta: string): CuentaLocal[] {
  return lista.filter((item) => item.idCuenta !== idCuenta)
}
