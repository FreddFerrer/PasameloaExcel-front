# PasameloFront

Frontend Angular de `PasameloaExcel` (Angular CLI `16.2.16`).

## Flujo implementado

1. Subir o arrastrar un PDF.
2. Boton `Generar Preview` para llamar `POST /api/v1/extract-preview`.
3. Spinner y estado de carga mientras procesa.
4. Modal con tabla editable localmente (sin llamadas por celda).
5. Borrar y agregar filas.
6. Boton `Descargar Excel` para enviar el estado final a `POST /api/v1/export-excel`.

## Variables de entorno (`.env`)

Este proyecto usa `scripts/prepare-env.mjs` para generar:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

en base a variables de entorno.

Copiar `.env.example` a `.env` y completar:

```env
FRONTEND_BACKEND_BASE_URL_DEV=http://localhost:8000
FRONTEND_BACKEND_BASE_URL_PROD=https://api-pasameloaexcel.up.railway.app
```

Importante: este es un frontend. Todo valor usado en build termina visible en el bundle final. Secretos reales (tokens privados, claves, passwords) deben vivir en backend, no en Angular.

## Scripts

- `npm run dev`: prepara variables y levanta Angular dev server.
- `npm run build`: prepara variables y genera build de produccion.
- `npm start`: sirve `dist/pasamelo-front` en `0.0.0.0:$PORT` (apto para Railway).
- `npm test`: ejecuta tests.

## Correr local

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Abrir `http://localhost:4200`.

