# BackendBank – Front end

React 19 + TypeScript + Vite. Consume el backend Spring Boot sin modificarlo.

## Requisitos
- Node.js 20.19+ o 22.12+ (`node -v`)
- Backend corriendo en http://localhost:8080

## Comandos
- `npm install` instala dependencias
- `npm run dev` servidor de desarrollo en http://localhost:5173 (las llamadas a `/api` se reenvían al backend)
- `npm test` pruebas con Vitest
- `npm run lint` oxlint
- `npm run build` genera `dist/`

## Variables
- `VITE_API_URL` (opcional): URL base del backend si no se usa el proxy `/api`.
  Si el backend queda en otro dominio en producción, necesitará CORS o un proxy inverso.

## Alcance
Registro, ingreso, crear/vincular cuentas, saldo, bloqueo, estado público, depósito con confirmación,
retiro y administración (actualizar datos / cambiar estado). El backend no tiene endpoints de listado,
por eso las cuentas se recuerdan en el navegador (localStorage, por cliente).
