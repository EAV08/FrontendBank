import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from './contexto'

export function RutaProtegida({ soloAdmin = false }: { soloAdmin?: boolean }) {
  const { sesion } = useSesion()
  const ubicacion = useLocation()

  if (!sesion) {
    return <Navigate to="/ingreso" replace state={{ desde: ubicacion.pathname }} />
  }
  
  if (soloAdmin && sesion.rol !== 'ADMINISTRADOR') {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
