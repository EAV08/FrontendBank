import type { ReactNode } from 'react'

export function Alerta({ tipo, children }: { tipo: 'error' | 'exito' | 'info'; children: ReactNode }) {
  return (
    <div className={`alerta alerta-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}
