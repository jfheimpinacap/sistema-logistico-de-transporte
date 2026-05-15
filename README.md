# Sistema Logístico de Transporte

Sistema logístico tipo TMS liviano para controlar transporte de mercancías, encomiendas, paquetes, rutas, conductores, vehículos, bodegas, evidencias de entrega, incidencias y documentos internos.

## Estado actual

**Prompt 011 — Frontend de evidencias de entrega e incidencias operativas**

El proyecto cuenta con:

- Monorepo con backend Django y frontend React + Vite + TypeScript + Tailwind.
- Backend Django REST Framework con configuración por `.env`.
- JWT para login, refresh y consulta de usuario actual.
- Endpoint de salud del backend.
- Frontend operativo base con login demo, layout, dashboard inicial y página de health.
- APIs REST autenticadas para maestros logísticos iniciales: clientes, contactos, zonas, direcciones, bodegas, tipos de vehículo, vehículos y conductores.
- CRUD frontend protegido para administrar clientes, contactos, zonas, direcciones, bodegas, tipos de vehículo, vehículos y conductores.
- Seeds idempotentes para usuario demo, datos maestros logísticos demo, operaciones demo, rutas demo y fieldops demo.
- Backend operativo para encomiendas, bultos y eventos de tracking con cambio de estado auditado.
- Frontend operativo protegido para administrar encomiendas, bultos, timeline de tracking y cambio manual de estado.
- Backend de rutas reales con paradas ordenadas, asignación de conductor/vehículo y vinculación de encomiendas a rutas.
- Frontend protegido para administrar rutas, paradas, asignación de encomiendas, cambio de estados, recálculo de resumen y reordenamiento manual de paradas.
- Backend de evidencias de entrega e incidencias operativas con archivos en `media/`, acciones de revisión/resolución y tracking asociado.
- Frontend protegido para administrar evidencias de entrega e incidencias operativas, incluyendo formularios con archivos opcionales, filtros, detalle y acciones custom.

> App conductor, documentos internos, optimización automática, mapas externos, cámara móvil, firma dibujada y GPS en tiempo real quedan para próximos prompts.

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
│   │   │   ├── fieldops/
│   │   │   ├── fleet/
│   │   │   ├── locations/
│   │   │   ├── logistics/
│   │   │   ├── parties/
│   │   │   └── routing/
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
- `MEDIA_URL`
- `MEDIA_ROOT`

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
python apps/backend/manage.py seed_demo_routes
python apps/backend/manage.py seed_demo_fieldops
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
- `GET /operations` — índice del módulo operativo de encomiendas, bultos, tracking, rutas, evidencias e incidencias.
- `GET /operations/shipments` — administración frontend de encomiendas con filtros, detalle y cambio de estado.
- `GET /operations/packages` — administración frontend de bultos asociados a encomiendas.
- `GET /operations/tracking` — consulta frontend de eventos de tracking.
- `GET /operations/routes` — administración frontend de rutas, paradas, asignación de encomiendas, estados y resumen.
- `GET /operations/delivery-proofs` — administración frontend de evidencias de entrega con filtros, creación/edición, detalle, aceptación, rechazo y desactivación.
- `GET /operations/incidents` — administración frontend de incidencias con filtros, creación/edición, detalle, resolución, cancelación y desactivación.

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

### Rutas y paradas protegidas con JWT

Todos los endpoints siguientes requieren header `Authorization: Bearer <access_token>` y permiten CRUD básico del módulo de rutas:

- `/api/routes/` — rutas reales con conductor, vehículo, bodega origen, estado, métricas y totales. Soporta `search`, `status`, `route_date`, `driver`, `vehicle`, `origin_warehouse` e `is_active`.
- `/api/route-stops/` — paradas ordenadas de ruta. Soporta filtros `route`, `status`, `stop_type`, `zone` e `is_active`.
- `/api/route-shipments/` — asignación de encomiendas a rutas y, opcionalmente, a paradas. Soporta filtros `route`, `stop`, `shipment`, `status` e `is_active`.
- `/api/routes/{id}/change-status/` — acción `POST` para cambiar estado de ruta, marcar timestamps reales y reservar/liberar conductor o vehículo cuando corresponde.
- `/api/routes/{id}/recalculate-summary/` — acción `POST` para recalcular totales de encomiendas, bultos, peso y volumen.
- `/api/routes/{id}/assign-shipments/` — acción `POST` para vincular encomiendas a una ruta, actualizar estado operativo y crear evento de tracking.
- `/api/routes/{id}/reorder-stops/` — acción `POST` para reordenar manualmente paradas de una ruta.
- `/api/route-stops/{id}/change-status/` — acción `POST` para cambiar estado de una parada y registrar timestamps de llegada/completado.

Comando demo idempotente:

```bash
python apps/backend/manage.py seed_demo_routes
```

Ejemplo de asignación de encomiendas a ruta:

```bash
curl -X POST http://localhost:8002/api/routes/1/assign-shipments/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"shipment_ids":[1,2],"stop_id":1}'
```

### Evidencias e incidencias protegidas con JWT

Todos los endpoints siguientes requieren header `Authorization: Bearer <access_token>` y permiten CRUD básico con soft delete (`is_active=false`):

- `/api/delivery-proofs/` — evidencias de entrega, retiro, devolución o entrega fallida. Soporta `search`, `shipment`, `package`, `route`, `route_stop`, `route_shipment`, `proof_type`, `status` e `is_active`.
- `/api/incidents/` — incidencias operativas en terreno. Soporta `search`, `shipment`, `package`, `route`, `route_stop`, `route_shipment`, `driver`, `vehicle`, `category`, `severity`, `status` e `is_active`.
- `/api/delivery-proofs/{id}/accept/` — acción `POST` para aceptar evidencia; si es `delivery` o `failed_delivery`, actualiza la encomienda/asignación y registra tracking.
- `/api/delivery-proofs/{id}/reject/` — acción `POST` para rechazar evidencia y registrar nota de tracking.
- `/api/incidents/{id}/resolve/` — acción `POST` para resolver una incidencia con notas y tracking asociado.
- `/api/incidents/{id}/cancel/` — acción `POST` para cancelar una incidencia con notas y tracking asociado.

Comando demo idempotente:

```bash
python apps/backend/manage.py seed_demo_fieldops
```

Ejemplo de resolución de incidencia:

```bash
curl -X POST http://localhost:8002/api/incidents/1/resolve/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"resolution_notes":"Se reprograma entrega para mañana"}'
```

> App conductor, documentos internos, GPS, cámara móvil, firma dibujada, optimización automática e integración con mapas externos quedan para próximos prompts.

Ejemplo de cambio de estado:

```bash
curl -X POST http://localhost:8002/api/shipments/1/change-status/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_transit","title":"En tránsito","description":"La encomienda salió a reparto","location_text":"Bodega Santiago"}'
```


## Flujo de prueba del Prompt 011

```bash
py start.py prepare
py start.py dev
```

Rutas principales de prueba:

- `/login`
- `/operations/delivery-proofs`
- `/operations/incidents`

Luego abre el frontend en `http://localhost:5175`, entra a `/login` con:

- Usuario demo: `demo`
- Password: `demo1234`

Después abre `/operations/delivery-proofs` para listar, crear/editar, revisar detalle, aceptar/rechazar o desactivar evidencias. Luego abre `/operations/incidents` para listar, crear/editar, revisar detalle, resolver/cancelar o desactivar incidencias. Si faltan datos base, entra primero a `/masters`, `/operations/shipments` o `/operations/routes` para crear encomiendas, rutas, conductores o vehículos.

### Endpoints usados por el frontend operativo

El frontend operativo consume estos endpoints protegidos:

- `GET|POST /api/shipments/` y `GET|PATCH|DELETE /api/shipments/{id}/`
- `GET|POST /api/packages/` y `GET|PATCH|DELETE /api/packages/{id}/`
- `GET|POST /api/tracking-events/` y `GET /api/tracking-events/{id}/`
- `POST /api/shipments/{id}/change-status/`
- `GET|POST /api/routes/` y `GET|PATCH|DELETE /api/routes/{id}/`
- `GET|POST /api/route-stops/` y `GET|PATCH|DELETE /api/route-stops/{id}/`
- `GET|POST /api/route-shipments/` y `GET|PATCH|DELETE /api/route-shipments/{id}/`
- `POST /api/routes/{id}/change-status/`
- `POST /api/routes/{id}/recalculate-summary/`
- `POST /api/routes/{id}/assign-shipments/`
- `POST /api/routes/{id}/reorder-stops/`
- `POST /api/route-stops/{id}/change-status/`
- `GET|POST /api/delivery-proofs/` y `GET|PATCH|DELETE /api/delivery-proofs/{id}/`
- `POST /api/delivery-proofs/{id}/accept/`
- `POST /api/delivery-proofs/{id}/reject/`
- `GET|POST /api/incidents/` y `GET|PATCH|DELETE /api/incidents/{id}/`
- `POST /api/incidents/{id}/resolve/`
- `POST /api/incidents/{id}/cancel/`


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

Las rutas, paradas y asignaciones demo se crean de forma idempotente con:

```bash
python apps/backend/manage.py seed_demo_routes
```

Este seed crea 2 rutas demo, 3 paradas y asignaciones de encomiendas con evento de tracking `Asignada a ruta`.

Las evidencias e incidencias demo se crean de forma idempotente con:

```bash
python apps/backend/manage.py seed_demo_fieldops
```

Este seed crea 2 evidencias demo, 3 incidencias demo y eventos de tracking tipo `exception` cuando la incidencia está asociada a una encomienda.

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
python apps/backend/manage.py seed_demo_routes
python apps/backend/manage.py seed_demo_fieldops
git diff --check
```

## Alcance actual

Incluye únicamente:

- Estructura base del monorepo.
- Configuración Django robusta con lectura de `.env`.
- Endpoint de salud `GET /api/health/`.
- Endpoints JWT de login, refresh y usuario actual.
- Usuario demo para desarrollo local.
- Frontend React con rutas, login demo, contexto de autenticación, layout operativo, dashboard, página de estado del sistema, CRUD inicial de maestros logísticos, módulo operativo de encomiendas, módulo frontend de rutas y módulo frontend de fieldops.
- Backend de maestros logísticos iniciales con apps `parties`, `locations` y `fleet`.
- Backend operativo de encomiendas con app `logistics`, modelos `Shipment`, `Package` y `TrackingEvent`, endpoints JWT y acción `change-status`.
- Backend de rutas con app `routing`, modelos `Route`, `RouteStop` y `RouteShipment`, endpoints JWT, soft delete, acciones de cambio de estado, asignación de encomiendas, recálculo de resumen y reordenamiento manual de paradas.
- Frontend de rutas con listados, formularios, detalle operativo, administración de paradas, asignación de encomiendas y acciones custom de ruta/parada.
- Backend de fieldops con app `fieldops`, modelos `DeliveryProof` e `Incident`, endpoints JWT, archivos en desarrollo, soft delete y acciones custom de aceptación/rechazo/resolución/cancelación.
- Frontend de fieldops con páginas `/operations/delivery-proofs` y `/operations/incidents`, tablas, formularios, paneles de detalle/revisión/resolución, filtros y soporte de links a adjuntos entregados por el backend.

No incluye todavía app conductor dedicada, carga real desde cámara móvil, firma dibujada, documentos internos, optimización automática de rutas, mapas externos, integración SII ni GPS en tiempo real. Esos módulos quedan pendientes para próximos prompts.
