# Sistema Logístico de Transporte

Sistema logístico tipo TMS liviano para controlar transporte de mercancías, encomiendas, paquetes, rutas, conductores, vehículos, bodegas, evidencias de entrega, incidencias y documentos internos.

## Estado actual

**Prompt 018 — Exportación CSV en listados operativos y cierre de fase MVP**

El proyecto cuenta con:

- Monorepo con backend Django y frontend React + Vite + TypeScript + Tailwind.
- Backend Django REST Framework con configuración por `.env`.
- JWT para login, refresh y consulta de usuario actual.
- Endpoint de salud del backend.
- Frontend operativo base con login demo, layout, dashboard inicial y página de health.
- APIs REST autenticadas para maestros logísticos iniciales: clientes, contactos, zonas, direcciones, bodegas, tipos de vehículo, vehículos y conductores.
- CRUD frontend protegido para administrar clientes, contactos, zonas, direcciones, bodegas, tipos de vehículo, vehículos y conductores.
- Seeds idempotentes para usuario demo, datos maestros logísticos demo, operaciones demo, rutas demo, fieldops demo y documentos internos demo.
- Backend operativo para encomiendas, bultos y eventos de tracking con cambio de estado auditado.
- Frontend operativo protegido para administrar encomiendas, bultos, timeline de tracking y cambio manual de estado.
- Backend de rutas reales con paradas ordenadas, asignación de conductor/vehículo y vinculación de encomiendas a rutas.
- Frontend protegido para administrar rutas, paradas, asignación de encomiendas, cambio de estados, recálculo de resumen y reordenamiento manual de paradas.
- Backend de evidencias de entrega e incidencias operativas con archivos en `media/`, acciones de revisión/resolución y tracking asociado.
- Frontend protegido para administrar evidencias de entrega e incidencias operativas, incluyendo formularios con archivos opcionales, filtros, detalle y acciones custom.
- Vista responsive de modo conductor en `/driver` para seleccionar rutas, iniciar/completar ruta, gestionar paradas, registrar evidencias/incidencias, adjuntar archivos y capturar ubicación puntual opcional.
- Backend de documentos internos logísticos para manifiestos de carga, hojas de ruta, notas internas de traslado y comprobantes internos de entrega.
- Frontend protegido de documentos internos en `/operations/documents`, con creación manual, edición, emisión interna, anulación, archivo, generación desde ruta/encomienda, líneas y vista imprimible HTML en `/operations/documents/print`.
- Backend de reportes operativos con app `reports`, endpoints JWT de solo lectura y métricas consolidadas para encomiendas, bultos, rutas, paradas, conductores, vehículos, evidencias, incidencias y documentos internos.
- Frontend protegido de reportes operativos en `/reports`, con dashboard analítico, filtros simples, tarjetas, barras CSS, tablas de conductores/vehículos y manejo amigable de errores sin dependencias externas de gráficos.
- Exportación CSV compatible con Excel para reportes de encomiendas, rutas, incidencias, documentos, rendimiento por conductor y uso por vehículo.
- Exportación CSV compatible con Excel también en listados operativos clave: `/operations/shipments`, `/operations/routes`, `/operations/incidents` y `/operations/documents`.
- Documento de cierre de fase MVP operativa en `docs/FASE_MVP_OPERATIVA.md`.

> La exportación genera CSV compatible con Excel, no archivos XLSX reales. XLSX real, PDF real, gráficos con librerías externas, mapas, GPS en tiempo real, optimización automática, integración SII, facturación y contabilidad quedan para próximos prompts.

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
│   │   │   ├── documents/
│   │   │   ├── fieldops/
│   │   │   ├── fleet/
│   │   │   ├── locations/
│   │   │   ├── logistics/
│   │   │   ├── parties/
│   │   │   ├── reports/
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
├── docs/
│   └── FASE_MVP_OPERATIVA.md
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
python apps/backend/manage.py seed_demo_documents
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

Flujo sugerido para probar Prompt 018:

```bash
py start.py prepare
py start.py dev
```

Luego abrir `/login`, ingresar con usuario demo `demo` y password `demo1234`, abrir `/operations` o `/reports`, aplicar filtros principales y descargar CSV desde los listados operativos o reportes. La descarga es CSV compatible con Excel, no XLSX real. Para el resumen del cierre MVP, revisar `docs/FASE_MVP_OPERATIVA.md`.

El comando sin argumentos asume `dev`. En Windows intenta abrir backend y frontend en terminales separadas.

## Rutas frontend disponibles

- `GET /login` — pantalla pública de login demo.
- `GET /` — dashboard operativo base, protegido por autenticación.
- `GET /health` — estado del sistema conectado a `GET /api/health/`, protegido por autenticación.
- `GET /driver` — modo conductor responsive para operar rutas, paradas, evidencias e incidencias desde móvil.
- `GET /masters` — índice de maestros logísticos, protegido por autenticación.
- `GET /masters/customers` — CRUD frontend de clientes.
- `GET /masters/contacts` — CRUD frontend de contactos.
- `GET /masters/zones` — CRUD frontend de zonas.
- `GET /masters/addresses` — CRUD frontend de direcciones.
- `GET /masters/warehouses` — CRUD frontend de bodegas.
- `GET /masters/vehicle-types` — CRUD frontend de tipos de vehículo.
- `GET /masters/vehicles` — CRUD frontend de vehículos.
- `GET /masters/drivers` — CRUD frontend de conductores.
- `GET /operations` — índice del módulo operativo de encomiendas, bultos, tracking, rutas, evidencias, incidencias y documentos.
- `GET /operations/shipments` — administración frontend de encomiendas con filtros, detalle, cambio de estado y exportación CSV compatible con Excel.
- `GET /operations/packages` — administración frontend de bultos asociados a encomiendas.
- `GET /operations/tracking` — consulta frontend de eventos de tracking.
- `GET /operations/routes` — administración frontend de rutas, paradas, asignación de encomiendas, estados, resumen y exportación CSV compatible con Excel.
- `GET /operations/delivery-proofs` — administración frontend de evidencias de entrega con filtros, creación/edición, detalle, aceptación, rechazo y desactivación.
- `GET /operations/incidents` — administración frontend de incidencias con filtros, creación/edición, detalle, resolución, cancelación, desactivación y exportación CSV compatible con Excel.
- `GET /operations/documents` — administración frontend de documentos internos/provisorios con filtros, creación/edición, acciones custom, generación desde ruta/encomienda, líneas y exportación CSV compatible con Excel.
- `GET /operations/documents/print` — vista imprimible HTML/CSS basada en `GET /api/documents/{id}/print-data/`.
- `GET /reports` — resumen general de reportes operativos y accesos a reportes específicos.
- `GET /reports/shipments` — reporte de encomiendas por estado, prioridad y tipo de servicio, con exportación CSV compatible con Excel.
- `GET /reports/routes` — reporte de rutas, paradas, asignaciones y resumen por fecha, con exportación CSV compatible con Excel.
- `GET /reports/incidents` — reporte de incidencias por estado, categoría, severidad y rankings, con exportación CSV compatible con Excel.
- `GET /reports/documents` — reporte de documentos internos/provisorios por tipo, estado y fecha de emisión, con exportación CSV compatible con Excel.
- `GET /reports/drivers` — tabla de rendimiento por conductor, con exportación CSV compatible con Excel.
- `GET /reports/vehicles` — tabla de uso por vehículo, con exportación CSV compatible con Excel.

## Documentación de fase

- `docs/FASE_MVP_OPERATIVA.md` resume el alcance cerrado del MVP operativo, flujos cubiertos, rutas principales, comandos de prueba y límites explícitos para próximas fases.
- Los documentos logísticos del MVP son internos/provisorios: no emiten documentos tributarios SII reales ni guía de despacho electrónica real.

## Endpoints backend disponibles

### Reportes operativos protegidos con JWT

El frontend de reportes usa estos endpoints de solo lectura:

- `GET /api/reports/overview/`
- `GET /api/reports/shipments-summary/`
- `GET /api/reports/routes-summary/`
- `GET /api/reports/incidents-summary/`
- `GET /api/reports/documents-summary/`
- `GET /api/reports/driver-performance/`
- `GET /api/reports/vehicle-usage/`

Endpoints de exportación CSV compatible con Excel:

- `GET /api/reports/export/shipments.csv`
- `GET /api/reports/export/routes.csv`
- `GET /api/reports/export/incidents.csv`
- `GET /api/reports/export/documents.csv`
- `GET /api/reports/export/driver-performance.csv`
- `GET /api/reports/export/vehicle-usage.csv`

Estos endpoints requieren JWT, respetan los filtros del reporte correspondiente y devuelven `text/csv; charset=utf-8` con `Content-Disposition` de descarga. Se reutilizan tanto desde `/reports/*` como desde los listados operativos principales. No generan XLSX real ni PDF real.

Filtros comunes soportados según endpoint: `date_from`, `date_to`, `status`, `current_status`, `priority`, `service_type`, `customer`, `driver`, `vehicle`, `origin_warehouse`, `document_type`, `category`, `severity` e `is_active`. El formato de fecha es `YYYY-MM-DD`.

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

### Documentos internos logísticos protegidos con JWT

Todos los endpoints siguientes requieren header `Authorization: Bearer <access_token>` y permiten CRUD básico con soft delete (`is_active=false`). Este módulo genera documentos internos/provisorios de operación logística y **NO emite documentos tributarios reales del SII**.

- `/api/documents/` — documentos internos. Soporta `search`, `document_type`, `status`, `customer`, `route`, `shipment`, `warehouse`, `driver`, `vehicle`, `issue_date` e `is_active`.
- `/api/document-lines/` — líneas/detalles de documentos. Soporta `search`, `document`, `shipment`, `package`, `route_stop` e `is_active`.
- `/api/documents/{id}/issue/` — acción `POST` para emitir internamente un documento y registrar tracking si está asociado a una encomienda.
- `/api/documents/{id}/cancel/` — acción `POST` para anular internamente un documento y registrar tracking si está asociado a una encomienda.
- `/api/documents/{id}/archive/` — acción `POST` para archivar internamente un documento.
- `/api/documents/generate-from-route/` — acción `POST` para generar manifiesto, hoja de ruta o nota interna de traslado desde una ruta.
- `/api/documents/generate-from-shipment/` — acción `POST` para generar comprobante interno de entrega o nota interna de traslado desde una encomienda.
- `/api/documents/{id}/print-data/` — acción `GET` que entrega JSON listo para la vista imprimible HTML/CSS del frontend. No genera PDF real.

Comando demo idempotente:

```bash
python apps/backend/manage.py seed_demo_documents
```

Ejemplo de generación desde ruta:

```bash
curl -X POST http://localhost:8002/api/documents/generate-from-route/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"route_id":1,"document_type":"route_manifest"}'
```

> No se implementan facturas, notas de crédito, notas de débito, guía de despacho electrónica real, integración SII, PDF real ni firma electrónica avanzada.

### Reportes operativos protegidos con JWT

Todos los endpoints siguientes requieren header `Authorization: Bearer <access_token>`, son de solo lectura y entregan datos agregados para dashboards y reportes. El frontend de reportes queda pendiente para **Prompt 016**.

- `/api/reports/overview/` — resumen general de encomiendas, rutas, incidencias, evidencias y documentos.
- `/api/reports/shipments-summary/` — métricas de encomiendas y bultos. Soporta `date_from`, `date_to`, `customer`, `current_status`, `priority`, `service_type` e `is_active`.
- `/api/reports/routes-summary/` — métricas de rutas, paradas y asignaciones. Soporta `date_from`, `date_to`, `driver`, `vehicle`, `status`, `origin_warehouse` e `is_active`.
- `/api/reports/incidents-summary/` — métricas de incidencias, severidades y rankings simples. Soporta `date_from`, `date_to`, `category`, `severity`, `status`, `driver`, `vehicle` e `is_active`.
- `/api/reports/documents-summary/` — métricas de documentos internos por tipo, estado y fecha de emisión. Soporta `date_from`, `date_to`, `document_type`, `status`, `customer`, `route`, `shipment` e `is_active`.
- `/api/reports/driver-performance/` — resumen por conductor. Soporta `date_from`, `date_to`, `driver` y `status`.
- `/api/reports/vehicle-usage/` — resumen por vehículo. Soporta `date_from`, `date_to`, `vehicle`, `vehicle_type` y `status`.

Los filtros de fecha usan formato ISO `YYYY-MM-DD`, por ejemplo `date_from=2026-05-01&date_to=2026-05-31`. Los filtros no enviados se omiten y las fechas inválidas responden HTTP 400 con un mensaje claro.

Ejemplo de resolución de incidencia:

```bash
curl -X POST http://localhost:8002/api/incidents/1/resolve/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"resolution_notes":"Se reprograma entrega para mañana"}'
```

> Offline, sincronización offline, firma dibujada, GPS en tiempo real, mapas externos, optimización automática, frontend de reportes e integración SII quedan para próximos prompts.

Ejemplo de cambio de estado:

```bash
curl -X POST http://localhost:8002/api/shipments/1/change-status/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_transit","title":"En tránsito","description":"La encomienda salió a reparto","location_text":"Bodega Santiago"}'
```


## Flujo de prueba del Prompt 013

```bash
py start.py prepare
py start.py dev
```

Rutas principales de prueba:

- `/login`
- `/driver`
- `/operations/routes`
- `/operations/delivery-proofs`
- `/operations/incidents`

Luego abre el frontend en `http://localhost:5175`, entra a `/login` con:

- Usuario demo: `demo`
- Password: `demo1234`

Flujo sugerido:

1. Ejecuta `py start.py prepare` para crear usuario y datos demo.
2. Ejecuta `py start.py dev` para iniciar backend y frontend.
3. Abre `/login` e ingresa con `demo` / `demo1234`.
4. Abre `/driver`.
5. Selecciona una ruta demo planificada, asignada, cargada o en curso.
6. Inicia la ruta.
7. Marca llegada en una parada.
8. Selecciona una encomienda de la parada y crea una evidencia o incidencia con archivo/ubicación opcional.

Si no aparecen rutas disponibles, entra primero a Operación logística > Rutas (`/operations/routes`) para crear o asignar rutas demo.

### Endpoints usados por modo conductor

La vista `/driver` consume estos endpoints protegidos:

- `GET /api/routes/`
- `GET /api/route-stops/`
- `GET /api/route-shipments/`
- `POST /api/routes/{id}/change-status/`
- `POST /api/route-stops/{id}/change-status/`
- `POST /api/delivery-proofs/`
- `POST /api/incidents/`

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
- `GET|POST /api/documents/` y `GET|PATCH|DELETE /api/documents/{id}/`
- `GET|POST /api/document-lines/` y `GET|PATCH|DELETE /api/document-lines/{id}/`
- `POST /api/documents/{id}/issue/`
- `POST /api/documents/{id}/cancel/`
- `POST /api/documents/{id}/archive/`
- `POST /api/documents/generate-from-route/`
- `POST /api/documents/generate-from-shipment/`
- `GET /api/documents/{id}/print-data/`

## Flujo de prueba del módulo de documentos

```bash
py start.py prepare
py start.py dev
```

1. Abrir `/login`.
2. Iniciar sesión con usuario demo `demo` y password `demo1234`.
3. Abrir `/operations/documents`.
4. Generar un documento desde una ruta demo.
5. Emitir internamente el documento.
6. Abrir la vista imprimible.
7. Usar el botón **Imprimir** del navegador.

> Este módulo maneja documentos internos/provisorios y **NO emite documentos tributarios reales del SII**. La optimización automática, mapas externos, GPS en tiempo real, firma electrónica avanzada, PDF real e integración SII quedan para prompts posteriores.

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
python apps/backend/manage.py seed_demo_documents
git diff --check
```

## Alcance actual

Incluye únicamente:

- Estructura base del monorepo.
- Configuración Django robusta con lectura de `.env`.
- Endpoint de salud `GET /api/health/`.
- Endpoints JWT de login, refresh y usuario actual.
- Usuario demo para desarrollo local.
- Frontend React con rutas, login demo, contexto de autenticación, layout operativo, dashboard, página de estado del sistema, CRUD inicial de maestros logísticos, módulo operativo de encomiendas, módulo frontend de rutas, módulo frontend de fieldops y módulo frontend de documentos internos.
- Backend de maestros logísticos iniciales con apps `parties`, `locations` y `fleet`.
- Backend operativo de encomiendas con app `logistics`, modelos `Shipment`, `Package` y `TrackingEvent`, endpoints JWT y acción `change-status`.
- Backend de rutas con app `routing`, modelos `Route`, `RouteStop` y `RouteShipment`, endpoints JWT, soft delete, acciones de cambio de estado, asignación de encomiendas, recálculo de resumen y reordenamiento manual de paradas.
- Frontend de rutas con listados, formularios, detalle operativo, administración de paradas, asignación de encomiendas y acciones custom de ruta/parada.
- Backend de fieldops con app `fieldops`, modelos `DeliveryProof` e `Incident`, endpoints JWT, archivos en desarrollo, soft delete y acciones custom de aceptación/rechazo/resolución/cancelación.
- Backend de documentos internos con app `documents`, modelos `LogisticsDocument` y `LogisticsDocumentLine`, endpoints JWT, soft delete, generación desde rutas/encomiendas, acciones de emisión/anulación/archivo y datos JSON para impresión futura.
- Backend de reportes operativos con app `reports`, servicios de agregación, endpoints JWT de solo lectura y filtros manuales sin `django-filter`.
- Frontend de fieldops con páginas `/operations/delivery-proofs` y `/operations/incidents`, tablas, formularios, paneles de detalle/revisión/resolución, filtros y soporte de links a adjuntos entregados por el backend.
- Frontend de documentos internos con página `/operations/documents`, vista `/operations/documents/print`, servicio autenticado, tipos TypeScript, tablas, formularios, paneles de acciones/generación/detalle/líneas y advertencias SII visibles.
- Modo conductor responsive en `/driver` con selección de ruta, resumen, acciones de inicio/completado, paradas ordenadas, cambio de estado de parada, encomiendas asociadas, evidencias, incidencias, archivos y geolocalización puntual opcional.

No incluye todavía frontend de reportes, gráficos, exportación Excel/PDF, app móvil nativa, modo offline, sincronización offline, firma dibujada, PDF real, firma electrónica avanzada, optimización automática de rutas, mapas externos, integración SII ni GPS en tiempo real. Esos módulos quedan pendientes para próximos prompts.
