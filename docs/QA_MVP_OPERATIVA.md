# QA MVP Operativa — Sistema Logístico de Transporte

## 1. Objetivo de la prueba

Esta guía valida el flujo funcional completo disponible al cierre de la Fase MVP Operativa del Sistema Logístico de Transporte. El objetivo es recorrer los módulos implementados, detectar errores bloqueantes de navegación o operación y confirmar que el sistema permite administrar maestros, encomiendas, bultos, tracking, rutas, modo conductor, evidencias, incidencias, documentos internos/provisorios, reportes y exportaciones CSV compatibles con Excel.

Esta prueba no valida funcionalidades fuera del MVP: mapas, GPS en tiempo real, optimización automática de rutas, PDF real, XLSX real, integración SII, facturación, contabilidad, modo offline ni app móvil nativa.

## 2. Preparación del entorno

Desde la raíz del repositorio `sistema-logistico-de-transporte`, ejecutar:

```bash
py start.py prepare
py start.py dev
```

Credenciales demo:

- Usuario: `demo`
- Password: `demo1234`

URLs locales:

- Frontend: <http://localhost:5175>
- Backend API: <http://localhost:8002/api>
- Health backend: <http://localhost:8002/api/health/>

## 3. Checklist general inicial

- [ ] Backend inicia sin errores bloqueantes.
- [ ] Frontend inicia sin errores bloqueantes.
- [ ] Login funciona con `demo` / `demo1234`.
- [ ] Dashboard carga después del login.
- [ ] Sidebar muestra módulos principales: dashboard, modo conductor, health, reportes, maestros y operación logística.
- [ ] HealthPage responde y muestra el estado del backend.
- [ ] No hay errores críticos visibles en consola del navegador.
- [ ] Las pantallas protegidas redirigen a `/login` cuando no hay sesión.

## 4. Prueba de autenticación

Pasos:

1. Abrir <http://localhost:5175/login>.
2. Ingresar usuario `demo` y password `demo1234`.
3. Presionar el botón de ingreso.
4. Validar redirección al dashboard `/`.
5. Usar el botón de logout/cerrar sesión disponible en el layout.
6. Intentar abrir una ruta protegida, por ejemplo `/operations` o `/reports`, sin sesión activa.

Resultado esperado:

- El login obtiene token JWT y permite navegar por el sistema.
- El dashboard carga sin errores.
- El logout elimina la sesión local.
- Las rutas protegidas sin sesión redirigen a `/login` y no muestran datos operativos.

## 5. Prueba de maestros logísticos

Validar los siguientes maestros:

- Clientes.
- Contactos.
- Zonas.
- Direcciones.
- Bodegas.
- Tipos de vehículo.
- Vehículos.
- Conductores.

Para cada maestro:

1. Abrir la ruta del sidebar correspondiente.
2. Validar que el listado cargue.
3. Buscar por texto si la pantalla lo permite.
4. Filtrar activos, inactivos y todos si la pantalla lo permite.
5. Crear un registro demo manual con datos claramente identificables.
6. Editar el registro creado.
7. Desactivar o eliminar el registro mediante la acción disponible.
8. Confirmar que el registro desactivado no rompe el listado ni los filtros.

Resultado esperado:

- Los CRUD de maestros permiten listar, crear, editar y desactivar registros sin errores bloqueantes.
- Los filtros y búsquedas devuelven resultados coherentes o estados vacíos amigables.

## 6. Prueba de encomiendas, bultos y tracking

Pasos:

1. Abrir `/operations/shipments`.
2. Crear una encomienda de prueba con cliente, origen, destino y datos obligatorios.
3. Editar la encomienda creada.
4. Cambiar el estado de la encomienda desde el panel de estado.
5. Abrir `/operations/packages`.
6. Crear un bulto asociado a la encomienda.
7. Editar el bulto si corresponde.
8. Abrir `/operations/tracking`.
9. Buscar o filtrar eventos asociados a la encomienda.
10. Volver al listado de encomiendas y usar la exportación CSV.

Resultado esperado:

- La encomienda y sus bultos se guardan correctamente.
- El cambio de estado crea eventos de tracking visibles.
- El CSV se descarga como archivo compatible con Excel; no debe generarse XLSX real.

## 7. Prueba de rutas y paradas

Pasos:

1. Abrir `/operations/routes`.
2. Crear una ruta con fecha, conductor, vehículo y bodega/origen si aplica.
3. Agregar una parada a la ruta.
4. Asignar una encomienda disponible a la ruta.
5. Cambiar el estado de la ruta.
6. Cambiar el estado de una parada.
7. Ejecutar recálculo de resumen.
8. Reordenar paradas si existen dos o más paradas.
9. Exportar CSV desde el listado de rutas.

Resultado esperado:

- La ruta mantiene paradas y encomiendas asignadas.
- Los cambios de estado y el recálculo actualizan el resumen operativo.
- El CSV de rutas se descarga correctamente como CSV compatible con Excel.

## 8. Prueba modo conductor

Pasos:

1. Abrir `/driver` en navegador de escritorio y, si es posible, en vista móvil/responsive.
2. Seleccionar una ruta demo disponible.
3. Iniciar la ruta.
4. Seleccionar una parada pendiente.
5. Marcar llegada en la parada.
6. Marcar la parada como completada o fallida según el caso de prueba.
7. Registrar una evidencia de entrega desde la vista conductor.
8. Registrar una incidencia desde la vista conductor.
9. Usar la captura de ubicación puntual si el navegador lo permite.
10. Completar la ruta cuando todas las paradas estén cerradas o el flujo lo permita.

Resultado esperado:

- La vista conductor es usable en ancho móvil.
- Las acciones principales de ruta y parada responden sin errores bloqueantes.
- La ubicación es opcional y, si el navegador la bloquea, la pantalla muestra un mensaje entendible.

## 9. Prueba de evidencias e incidencias

Pasos para evidencias:

1. Abrir `/operations/delivery-proofs`.
2. Listar evidencias.
3. Crear una evidencia manual.
4. Abrir el detalle de una evidencia.
5. Aceptar la evidencia.
6. Crear o editar otra evidencia y rechazarla con observación.

Pasos para incidencias:

1. Abrir `/operations/incidents`.
2. Listar incidencias.
3. Crear una incidencia.
4. Abrir el detalle de una incidencia.
5. Resolver la incidencia con nota de cierre.
6. Crear o seleccionar otra incidencia y cancelarla.
7. Exportar CSV desde incidencias.

Resultado esperado:

- Evidencias e incidencias se gestionan sin romper la UI.
- Las acciones de aceptación, rechazo, resolución y cancelación actualizan estado.
- La exportación de incidencias genera CSV compatible con Excel.

## 10. Prueba de documentos internos

Pasos:

1. Abrir `/operations/documents`.
2. Crear un documento manual.
3. Crear una línea asociada al documento.
4. Generar un documento desde una ruta.
5. Generar un documento desde una encomienda.
6. Emitir internamente un documento.
7. Anular un documento de prueba.
8. Archivar un documento de prueba.
9. Abrir la vista imprimible.
10. Usar el botón imprimir del navegador.
11. Validar que la advertencia SII sea visible.
12. Exportar CSV desde documentos.

Resultado esperado:

- Los documentos se identifican como internos/provisorios.
- La pantalla advierte que no son documentos tributarios SII reales.
- La vista imprimible es HTML/CSS y no reemplaza PDF real.
- El CSV de documentos se descarga como CSV compatible con Excel.

## 11. Prueba de reportes

Validar estas rutas:

- `/reports`.
- `/reports/shipments`.
- `/reports/routes`.
- `/reports/incidents`.
- `/reports/documents`.
- `/reports/drivers`.
- `/reports/vehicles`.

Para cada reporte específico:

1. Abrir la ruta.
2. Validar que las métricas carguen.
3. Aplicar filtros disponibles.
4. Refrescar el reporte.
5. Exportar CSV.
6. Confirmar que el archivo descargado sea CSV compatible con Excel.

Resultado esperado:

- Los reportes cargan métricas sin errores bloqueantes.
- Los filtros aplican y pueden limpiarse.
- La exportación no genera XLSX real ni PDF real.

## 12. Prueba de errores esperados

Validar escenarios controlados:

- [ ] Backend apagado: el frontend muestra error amable y no queda en blanco.
- [ ] Sesión expirada o token inválido: se muestra mensaje o se solicita iniciar sesión nuevamente.
- [ ] Listas vacías: la UI muestra estado vacío y no rompe componentes.
- [ ] Filtros inválidos en reportes: se muestra error claro o se ignora el filtro inválido sin caída del frontend.
- [ ] Exportación fallida: se informa error y la pantalla sigue operativa.

## 13. Criterio de aprobación

El MVP se considera aprobado para la prueba manual cuando:

- Los flujos principales se completan de extremo a extremo.
- No existen errores bloqueantes en login, dashboard, navegación, operación, modo conductor, documentos o reportes.
- Las exportaciones CSV descargan archivos compatibles con Excel.
- Los documentos internos/provisorios tienen vista imprimible.
- Las advertencias tributarias/SII están visibles en documentos.
- El modo conductor funciona en vista responsive.
- Los límites del MVP están claros: no SII real, no facturación, no GPS en tiempo real, no mapas, no optimización, no offline, no PDF real y no XLSX real.

## 14. Observaciones para el tester

Usar esta tabla para registrar hallazgos durante la ejecución manual:

| ID | Módulo | Pantalla/Ruta | Pasos para reproducir | Resultado actual | Resultado esperado | Severidad | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| QA-001 |  |  |  |  |  |  |  |
| QA-002 |  |  |  |  |  |  |  |
| QA-003 |  |  |  |  |  |  |  |

Severidades sugeridas:

- Bloqueante: impide ejecutar un flujo principal.
- Alta: afecta una función crítica pero existe workaround.
- Media: afecta una función secundaria o un caso particular.
- Baja: texto, visual, validación menor o mejora no bloqueante.
