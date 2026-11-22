import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useSesion } from '../auth/contexto'

export function Diseno() {
  const { sesion, cerrarSesion } = useSesion()
  const navegar = useNavigate()

  function salir() {
    cerrarSesion()
    navegar('/ingreso')
  }

  return (
    <>
      <header className="cabecera">
        <strong>BackendBank</strong>
        <nav>
          {sesion ? (
            <>
              <NavLink to="/cuentas">Mis cuentas</NavLink>
              <NavLink to="/operaciones">Depósitos y retiros</NavLink>
              {sesion.rol === 'ADMINISTRADOR' && <NavLink to="/admin">Administración</NavLink>}
              <NavLink to="/estado">Estado de cuenta</NavLink>
              <span className="usuario">{sesion.usuario}</span>
              <button type="button" className="secundario" onClick={salir}>
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/ingreso">Ingresar</NavLink>
              <NavLink to="/registro">Registrarse</NavLink>
              <NavLink to="/estado">Estado de cuenta</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
    </>
  )
}
