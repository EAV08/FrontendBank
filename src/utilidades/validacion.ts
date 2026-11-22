// Longitudes máximas que acepta el backend en cada campo.
export const LIMITES = {
  nombreComercial: 150,
  razonSocial: 200,
  nitDocumento: 30,
  email: 150,
  usuario: 80,
  contrasena: 255,
  telefono: 20,
  motivo: 200,
  numeroCuenta: 20,
} as const

const PATRON_MONTO = /^\d{1,12}(\.\d{1,2})?$/
const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Convierte el texto escrito en un monto válido (máximo 12 enteros y 2 decimales), o null. */
export function interpretarMonto(texto: string): number | null {
  const normalizado = texto.trim().replace(',', '.')
  if (!PATRON_MONTO.test(normalizado)) {
    return null
  }
  const valor = Number(normalizado)
  return valor > 0 ? valor : null
}

export function esUuid(texto: string): boolean {
  return PATRON_UUID.test(texto.trim())
}
