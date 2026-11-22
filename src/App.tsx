import { Navigate, Route, Routes } from 'react-router-dom'
import { RutaProtegida } from './auth/RutaProtegida'
import { Diseno } from './componentes/Diseno'
import { Admin } from './paginas/Admin'
import { Cuentas } from './paginas/Cuentas'
import { EstadoPublico } from './paginas/EstadoPublico'
import { Ingreso } from './paginas/Ingreso'
import { Operaciones } from './paginas/Operaciones'
import { Registro } from './paginas/Registro'

export default function App() {
  return (
    <Routes>
      <Route element={<Diseno />}>
        <Route path="/ingreso" element={<Ingreso />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/estado" element={<EstadoPublico />} />
        <Route element={<RutaProtegida />}>
          <Route path="/cuentas" element={<Cuentas />} />
          <Route path="/operaciones" element={<Operaciones />} />
        </Route>
        <Route element={<RutaProtegida soloAdmin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/cuentas" replace />} />
      </Route>
    </Routes>
  )
}
