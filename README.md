# Sistema Logístico de Transporte

Sistema logístico tipo TMS liviano para iniciar el control operativo de transporte de mercancías, encomiendas, paquetes y documentación interna de traslado.

> Estado actual: **Prompt 002 — Backend base y autenticación**. El repositorio contiene el monorepo inicial, backend Django con API base, autenticación JWT y usuario demo. Los módulos logísticos de negocio aún no están implementados.

## Stack actual

- **Backend:** Django + Django REST Framework.
- **Autenticación:** JWT con SimpleJWT.
- **Frontend:** React + Vite + TypeScript.
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
│       ├── public/
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── docs/
├── scripts/
├── .env.example
├── .gitignore
├── README.md
└── start.py
```

## Puertos definidos

- Backend Django: `http://localhost:8002`
- Frontend Vite: `http://localhost:5175`

Los puertos se pueden ajustar con las variables `BACKEND_PORT` y `FRONTEND_PORT`.

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

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `BACKEND_PORT`
- `FRONTEND_PORT`

## Preparar el entorno

Instala dependencias, ejecuta migraciones y crea/actualiza el usuario demo:

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

Iniciar entorno de desarrollo local:

```bash
py start.py
```

El comando sin argumentos asume `dev`. En Windows intenta abrir backend y frontend en terminales separadas.

## Endpoints disponibles

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
- App React inicial con el texto “Sistema Logístico de Transporte” y “Panel operativo inicial”.
- Orquestador local `start.py`.

No incluye todavía clientes, destinatarios, bodegas, conductores, vehículos, encomiendas, bultos, rutas, paradas, tracking logístico, incidencias, documentos internos, dashboard, app conductor ni optimización de rutas. Eso queda pendiente para próximos prompts.
