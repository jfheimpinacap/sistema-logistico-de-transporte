# Sistema Logístico de Transporte

Sistema logístico tipo TMS liviano para iniciar el control operativo de transporte de mercancías, encomiendas, paquetes y documentación interna de traslado.

> Estado actual: **Prompt 003 — Frontend operativo base**. El repositorio contiene el monorepo inicial, backend Django con API base, autenticación JWT, usuario demo y frontend React operativo con login, layout administrativo y conexión al endpoint de salud. Los módulos logísticos reales de negocio aún no están implementados.

## Stack actual

- **Backend:** Django + Django REST Framework.
- **Autenticación:** JWT con SimpleJWT.
- **Frontend:** React + Vite + TypeScript.
- **Ruteo frontend:** Router liviano propio del MVP (React Router queda pendiente porque el registro npm bloqueó su instalación en este entorno).
- **Estilos frontend:** Tailwind CSS.
- **Base de datos inicial:** SQLite.
- **Base de datos futura:** PostgreSQL/PostGIS, no implementada todavía.
- **Orquestación local:** `start.py` en la raíz del proyecto.

## Estructura de carpetas

```text
sistema-logistico-de-transporte/
├── apps/
│   ├── backend/
│   │   ├── apps/
│   │   │   ├── accounts/
│   │   │   └── core/
│   │   ├── config/
│   │   ├── manage.py
│   │   └── requirements.txt
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── pages/
│       │   ├── routes/
│       │   ├── services/
│       │   └── types/
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── .env.example
├── .gitignore
├── README.md
└── start.py
```

## Puertos definidos

- Backend Django: `http://localhost:8002`
- Frontend Vite: `http://localhost:5175`
- API base usada por el frontend: `http://localhost:8002/api`

Los puertos se pueden ajustar con las variables `BACKEND_PORT` y `FRONTEND_PORT`. La URL base del API se ajusta con `VITE_API_BASE_URL`.

## Configuración de entorno

Copia el archivo de ejemplo antes de ejecutar el proyecto localmente:

```bash
cp .env.example .env
```

En Windows también puedes usar:

```powershell
copy .env.example .env
```

Variables principales soportadas:

- `APP_OPEN_URL`
- `FRONTEND_PORT`
- `BACKEND_PORT`
- `VITE_API_BASE_URL`
- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`

## Preparar el entorno

Primero instala dependencias, ejecuta migraciones y crea/actualiza el usuario demo:

```bash
py start.py prepare
```

Comandos equivalentes para el backend:

```bash
python apps/backend/manage.py migrate
python apps/backend/manage.py seed_demo_user
```

## Ejecutar el proyecto

Iniciar backend:

```bash
py start.py backend
```

Iniciar frontend:

```bash
py start.py frontend
```

Iniciar entorno de desarrollo local completo:

```bash
py start.py dev
```

El comando sin argumentos asume `dev`. En Windows intenta abrir backend y frontend en terminales separadas.

## Rutas frontend disponibles

- `GET /login` — pantalla pública de login demo.
- `GET /` — dashboard operativo base, protegido por autenticación.
- `GET /health` — estado del sistema conectado a `GET /api/health/`, protegido por autenticación.

## Endpoints backend disponibles

- `GET /api/health/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`

Ejemplo de login:

```bash
curl -X POST http://localhost:8002/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo1234"}'
```

Para consultar el usuario actual, usa el token `access` devuelto por login:

```bash
curl http://localhost:8002/api/auth/me/ \
  -H "Authorization: Bearer <access_token>"
```

## Credenciales demo

- Usuario: `demo`
- Password: `demo1234`
- Email: `demo@example.com`

El usuario demo se crea de forma idempotente con:

```bash
python apps/backend/manage.py seed_demo_user
```

## Alcance actual

Incluye únicamente:

- Estructura base del monorepo.
- Configuración Django robusta con lectura de `.env`.
- Endpoint de salud `GET /api/health/`.
- Endpoints JWT de login, refresh y usuario actual.
- Usuario demo para desarrollo local.
- Frontend React con rutas, login demo, contexto de autenticación, layout operativo, dashboard estático y página de estado del sistema.

No incluye todavía modelos frontend reales de encomiendas, CRUD de clientes, bodegas, conductores, vehículos, rutas, carga de evidencias, documentos, optimización ni dashboard con métricas reales. Eso queda pendiente para próximos prompts, comenzando en el **Prompt 004**.
