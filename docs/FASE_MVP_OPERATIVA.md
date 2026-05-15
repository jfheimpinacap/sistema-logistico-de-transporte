# Fase MVP Operativa — Sistema Logístico de Transporte

## 1. Resumen de la fase

La fase MVP operativa deja disponible un TMS liviano para administrar datos maestros, encomiendas, bultos, tracking, rutas, operación en terreno desde vista conductor, evidencias, incidencias, documentos internos/provisorios, reportes y exportaciones CSV compatibles con Excel.

El alcance actual está orientado a control operacional y trazabilidad básica. No reemplaza sistemas tributarios, facturación, optimización avanzada, mapas ni una aplicación móvil nativa.

## 2. Módulos implementados

- Autenticación JWT con usuario demo.
- Maestros logísticos: clientes, contactos, zonas, direcciones, bodegas, tipos de vehículo, vehículos y conductores.
- Encomiendas y bultos con estados, detalle y administración operativa.
- Tracking de eventos asociados a la operación.
- Rutas y paradas con asignación de encomiendas, conductor y vehículo.
- Vista conductor MVP responsive para operar rutas y paradas desde terreno.
- Evidencias de entrega con revisión operativa.
- Incidencias con registro, resolución y cancelación.
- Documentos internos/provisorios logísticos con vista imprimible HTML.
- Reportes operativos y dashboard analítico.
- Exportación CSV compatible con Excel desde reportes y listados operativos clave.

## 3. Flujos operativos cubiertos

- Crear y mantener maestros logísticos.
- Crear una encomienda y sus bultos.
- Crear una ruta con paradas.
- Asignar encomiendas a una ruta.
- Operar la ruta desde modo conductor.
- Registrar evidencia de entrega o incidencia.
- Gestionar documentos internos/provisorios.
- Revisar reportes operativos.
- Exportar CSV compatible con Excel desde reportes y listados principales.

## 4. Qué NO hace todavía

- No emite documentos SII reales.
- No factura.
- No genera XLSX real.
- No genera PDF real.
- No tiene mapas.
- No tiene GPS en tiempo real.
- No tiene optimización automática de rutas.
- No tiene modo offline.
- No es una app móvil nativa.

## 5. Comandos de prueba

```bash
py start.py prepare
py start.py dev
```

Luego abrir `/login` e ingresar con:

- Usuario: `demo`
- Password: `demo1234`

## 6. Rutas frontend principales

- `/login`
- `/`
- `/driver`
- `/masters`
- `/operations`
- `/operations/shipments`
- `/operations/routes`
- `/operations/delivery-proofs`
- `/operations/incidents`
- `/operations/documents`
- `/reports`

## 7. Próximas fases sugeridas

- Prompt 019: QA funcional y pruebas manuales guiadas.
- Prompt 020: mapas/geocodificación base.
- Prompt 021: optimización inicial de rutas.
- Prompt 022: PDF real o vista imprimible avanzada.
- Prompt 023: integración SII futura, solo si se define alcance tributario.
