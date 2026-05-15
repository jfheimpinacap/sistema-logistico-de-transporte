# Sistema Logístico de Transporte

Sistema logístico tipo TMS liviano para controlar transporte de mercancías, encomiendas, paquetes, rutas, conductores, vehículos, bodegas, evidencias de entrega, incidencias y documentos internos.

## Estado actual

**Prompt 007 — Frontend operativo de encomiendas, bultos y tracking**

El proyecto cuenta con:

- Monorepo con backend Django y frontend React + Vite + TypeScript + Tailwind.
- Backend Django REST Framework con configuración por `.env`.
- JWT para login, refresh y consulta de usuario actual.
- Endpoint de salud del backend.
- Frontend operativo base con login demo, layout, dashboard inicial y página de health.
- APIs REST autenticadas para maestros logísticos iniciales: clientes, contactos, zonas, direcciones, bodegas, tipos de vehículo, vehículos y conductores.
- CRUD frontend protegido para administrar clientes, contactos, zonas, direcciones, bodegas, tipos de vehículo, vehículos y conductores.
- Seeds idempotentes para usuario demo, datos maestros logísticos demo y operaciones demo.
- Backend operativo para encomiendas, bultos y eventos de tracking con cambio de estado auditado.
- Frontend operativo protegido para administrar encomiendas, bultos, timeline de tracking y cambio manual de estado.

> Rutas reales, paradas, app conductor, evidencias, incidencias avanzadas, documentos internos, optimización y GPS quedan para próximos prompts.

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
│   │   │   ├── logistics/
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
python apps/backend/manage.py seed_demo_operations
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
- `GET /operations` — índice del módulo operativo de encomiendas, bultos y tracking.
- `GET /operations/shipments` — administración frontend de encomiendas con filtros, detalle y cambio de estado.
- `GET /operations/packages` — administración frontend de bultos asociados a encomiendas.
- `GET /operations/tracking` — consulta frontend de eventos de tracking.

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

### Operaciones protegidas con JWT

Todos los endpoints siguientes requieren header `Authorization: Bearer <access_token>` y permiten CRUD básico del módulo operativo:

- `/api/shipments/` — encomiendas/envíos principales. Soporta `search`, `current_status`, `priority`, `service_type`, `is_active` y `customer`.
- `/api/packages/` — bultos asociados a encomiendas. Soporta filtros `shipment`, `status` e `is_active`.
- `/api/tracking-events/` — historial de tracking ordenado por defecto del más reciente al más antiguo (`occurred_at` descendente). Soporta filtros `shipment`, `package` y `status`.
- `/api/shipments/{id}/change-status/` — acción `POST` para actualizar `current_status` de la encomienda y registrar un `TrackingEvent`.

Ejemplo de cambio de estado:

```bash
curl -X POST http://localhost:8002/api/shipments/1/change-status/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_transit","title":"En tránsito","description":"La encomienda salió a reparto","location_text":"Bodega Santiago"}'
```


## Flujo de prueba del Prompt 007

```bash
py start.py prepare
py start.py dev
```

Luego abre el frontend en `http://localhost:5175`, entra a `/login` con:

- Usuario demo: `demo`
- Password: `demo1234`

Después abre `/operations/shipments` para listar encomiendas, crear/editar registros, revisar detalle, administrar bultos relacionados y cambiar estados. Si faltan datos base, entra primero a `/masters` para crear clientes, direcciones y bodegas.

### Endpoints usados por el frontend operativo

El frontend del Prompt 007 consume estos endpoints protegidos:

- `GET|POST /api/shipments/` y `GET|PATCH|DELETE /api/shipments/{id}/`
- `GET|POST /api/packages/` y `GET|PATCH|DELETE /api/packages/{id}/`
- `GET|POST /api/tracking-events/` y `GET /api/tracking-events/{id}/`
- `POST /api/shipments/{id}/change-status/`


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

Las encomiendas, bultos y eventos de tracking demo se crean de forma idempotente con:

```bash
python apps/backend/manage.py seed_demo_operations
```

Este seed crea 3 encomiendas demo, 1 o 2 bultos por encomienda y eventos iniciales en estados `received`, `classified` y `ready_for_route`.

El seed de maestros crea datos mínimos de ejemplo:

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
python apps/backend/manage.py seed_demo_operations
```

## Alcance actual

Incluye únicamente:

- Estructura base del monorepo.
- Configuración Django robusta con lectura de `.env`.
- Endpoint de salud `GET /api/health/`.
- Endpoints JWT de login, refresh y usuario actual.
- Usuario demo para desarrollo local.
- Frontend React con rutas, login demo, contexto de autenticación, layout operativo, dashboard, página de estado del sistema, CRUD inicial de maestros logísticos y módulo operativo de encomiendas.
- Backend de maestros logísticos iniciales con apps `parties`, `locations` y `fleet`.
- Backend operativo de encomiendas con app `logistics`, modelos `Shipment`, `Package` y `TrackingEvent`, endpoints JWT y acción `change-status`.

No incluye todavía rutas reales, paradas, asignación de vehículos/conductores a rutas, app conductor, evidencias de entrega, incidencias avanzadas, documentos internos, optimización de rutas ni GPS. Esos módulos quedan pendientes para próximos prompts.
