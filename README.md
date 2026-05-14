# Sistema Logístico de Transporte

Sistema logístico tipo TMS liviano para controlar transporte de mercancías, encomiendas, paquetes, rutas, conductores, vehículos, bodegas, evidencias de entrega, incidencias y documentos internos.

## Estado actual

**Prompt 005 — Frontend CRUD de maestros logísticos**

El proyecto cuenta con:

- Monorepo con backend Django y frontend React + Vite + TypeScript + Tailwind.
- Backend Django REST Framework con configuración por `.env`.
- JWT para login, refresh y consulta de usuario actual.
- Endpoint de salud del backend.
- Frontend operativo base con login demo, layout, dashboard inicial y página de health.
- APIs REST autenticadas para maestros logísticos iniciales: clientes, contactos, zonas, direcciones, bodegas, tipos de vehículo, vehículos y conductores.
- CRUD frontend protegido para administrar clientes, contactos, zonas, direcciones, bodegas, tipos de vehículo, vehículos y conductores.
- Seeds idempotentes para usuario demo y datos maestros logísticos demo.

> Encomiendas, bultos, rutas reales, paradas, tracking, incidencias, documentos internos, optimización, GPS y app conductor quedan para próximos prompts.

## Stack técnico

- **Backend:** Django + Django REST Framework.
- **Autenticación:** JWT con `djangorestframework-simplejwt`.
- **Frontend:** React + Vite + TypeScript.
- **Routing frontend:** Router liviano propio del MVP (React Router queda pendiente porque el registro npm bloqueó su instalación en este entorno).
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
│   │   │   ├── core/
│   │   │   ├── fleet/
│   │   │   ├── locations/
│   │   │   └── parties/
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

Primero instala dependencias, ejecuta migraciones y crea/actualiza datos demo:

```bash
py start.py prepare
```

Comandos equivalentes para el backend:

```bash
python apps/backend/manage.py migrate
python apps/backend/manage.py seed_demo_user
python apps/backend/manage.py seed_demo_logistics
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
- `GET /masters` — índice de maestros logísticos, protegido por autenticación.
- `GET /masters/customers` — CRUD frontend de clientes.
- `GET /masters/contacts` — CRUD frontend de contactos.
- `GET /masters/zones` — CRUD frontend de zonas.
- `GET /masters/addresses` — CRUD frontend de direcciones.
- `GET /masters/warehouses` — CRUD frontend de bodegas.
- `GET /masters/vehicle-types` — CRUD frontend de tipos de vehículo.
- `GET /masters/vehicles` — CRUD frontend de vehículos.
- `GET /masters/drivers` — CRUD frontend de conductores.

## Endpoints backend disponibles

### Públicos o autenticación base

- `GET /api/health/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/` — requiere JWT.

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

### Maestros logísticos protegidos con JWT

Todos los endpoints siguientes requieren header `Authorization: Bearer <access_token>` y permiten listar, crear, ver detalle, editar y eliminar. La eliminación es soft delete: marca `is_active=false` cuando el modelo tiene ese campo.

- `/api/customers/`
- `/api/contacts/`
- `/api/zones/`
- `/api/addresses/`
- `/api/warehouses/`
- `/api/vehicle-types/`
- `/api/vehicles/`
- `/api/drivers/`

El frontend de maestros usa estos endpoints para `GET`, `POST`, `PATCH` y `DELETE`:

- `GET|POST /api/customers/` y `PATCH|DELETE /api/customers/<id>/`
- `GET|POST /api/contacts/` y `PATCH|DELETE /api/contacts/<id>/`
- `GET|POST /api/zones/` y `PATCH|DELETE /api/zones/<id>/`
- `GET|POST /api/addresses/` y `PATCH|DELETE /api/addresses/<id>/`
- `GET|POST /api/warehouses/` y `PATCH|DELETE /api/warehouses/<id>/`
- `GET|POST /api/vehicle-types/` y `PATCH|DELETE /api/vehicle-types/<id>/`
- `GET|POST /api/vehicles/` y `PATCH|DELETE /api/vehicles/<id>/`
- `GET|POST /api/drivers/` y `PATCH|DELETE /api/drivers/<id>/`

Parámetros simples soportados en listados:

- `search=<texto>` para búsqueda básica.
- `is_active=true|false` para filtrar por estado activo.

Ejemplo:

```bash
curl "http://localhost:8002/api/vehicles/?search=CAMI&is_active=true" \
  -H "Authorization: Bearer <access_token>"
```


## Flujo de prueba del Prompt 005

```bash
py start.py prepare
py start.py dev
```

Luego abre el frontend en `http://localhost:5175`, entra a `/login` con:

- Usuario demo: `demo`
- Password: `demo1234`

Después abre `/masters` para entrar al índice de maestros y prueba altas, ediciones, búsqueda, filtro por estado y desactivación de registros.

## Credenciales demo

- Usuario: `demo`
- Password: `demo1234`
- Email: `demo@example.com`

El usuario demo se crea de forma idempotente con:

```bash
python apps/backend/manage.py seed_demo_user
```

Los datos maestros logísticos demo se crean de forma idempotente con:

```bash
python apps/backend/manage.py seed_demo_logistics
```

Este seed crea datos mínimos de ejemplo:

- 2 zonas.
- 2 direcciones.
- 1 bodega.
- 2 tipos de vehículo: Moto y Camioneta.
- 2 vehículos.
- 2 conductores.
- 2 clientes.

## Validaciones recomendadas

```bash
python -m py_compile start.py
python -m py_compile apps/backend/manage.py
python apps/backend/manage.py check
python apps/backend/manage.py makemigrations --check
python apps/backend/manage.py migrate
python apps/backend/manage.py seed_demo_user
python apps/backend/manage.py seed_demo_logistics
```

## Alcance actual

Incluye únicamente:

- Estructura base del monorepo.
- Configuración Django robusta con lectura de `.env`.
- Endpoint de salud `GET /api/health/`.
- Endpoints JWT de login, refresh y usuario actual.
- Usuario demo para desarrollo local.
- Frontend React con rutas, login demo, contexto de autenticación, layout operativo, dashboard, página de estado del sistema y CRUD inicial de maestros logísticos.
- Backend de maestros logísticos iniciales con apps `parties`, `locations` y `fleet`.

No incluye todavía encomiendas, bultos, rutas reales, paradas, tracking de paquetes, incidencias, documentos internos, optimización de rutas, GPS ni app conductor. Eso queda pendiente para próximos prompts, comenzando en el **Prompt 006**.
