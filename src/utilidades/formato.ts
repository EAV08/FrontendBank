const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

export function formatearMonto(valor: number): string {
  return formatoMoneda.format(valor)
}

export function formatearFechaHora(milisegundos: number): string {
  return formatoFecha.format(new Date(milisegundos))
}
