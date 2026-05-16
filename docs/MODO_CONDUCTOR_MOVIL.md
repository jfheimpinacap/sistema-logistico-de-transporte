# Modo conductor web móvil

## 1. Objetivo

`/driver` es una vista web responsive para operar rutas desde navegador móvil. Está pensada para conductores internos o externos que necesitan revisar rutas, avanzar paradas, registrar evidencia, reportar incidencias y capturar una ubicación puntual sin instalar una app nativa.

## 2. Alcance actual

El modo conductor permite:

- Ver rutas disponibles para operación.
- Iniciar y completar una ruta.
- Ver el resumen operativo de la ruta.
- Ver paradas en orden y cambiar su estado.
- Marcar llegada, parada completada o parada fallida.
- Ver encomiendas asociadas a la ruta o parada seleccionada.
- Registrar evidencia de entrega con foto/archivo opcional.
- Registrar incidencia operativa con evidencia adjunta opcional.
- Capturar ubicación puntual desde el navegador cuando el usuario presiona el botón correspondiente.

## 3. Conductores internos y externos

- Conductores internos pueden operar vehículos propios de la empresa y registrar acciones desde el navegador móvil.
- Conductores externos pueden operar desde la web móvil usando su propio vehículo.
- El flujo actual no asume que todos los vehículos tengan GPS instalado.
- Todavía no existe asociación formal `User ↔ Driver`; por ahora la vista muestra rutas disponibles/asignadas para operación.

## 4. Ubicación

- La ubicación se captura de forma puntual desde el navegador.
- La captura ocurre solo cuando el conductor presiona **Capturar ubicación actual**.
- No es GPS en tiempo real.
- No hay tracking continuo todavía.
- Si el navegador no soporta geolocalización o el usuario deniega el permiso, los formularios pueden guardarse sin ubicación.

## 5. Fuera de alcance

Este modo web móvil no implementa todavía:

- App Android/iOS nativa.
- Modo offline.
- Sincronización offline.
- GPS continuo.
- Tracking en tiempo real.
- Firma dibujada.
- Cámara custom.
- Optimización automática de rutas.
- Mapas reales.

## 6. Flujo de prueba

1. Ejecutar `py start.py prepare`.
2. Ejecutar `py start.py dev`.
3. Abrir `/login`.
4. Iniciar sesión con `demo` / `demo1234`.
5. Abrir `/driver`.
6. Seleccionar una ruta disponible.
7. Iniciar ruta.
8. Revisar resumen, paradas y encomiendas.
9. Marcar llegada a una parada.
10. Marcar parada completada o fallida.
11. Registrar evidencia de entrega.
12. Registrar incidencia operativa.
13. Capturar ubicación puntual si se desea.
14. Completar ruta.

## 7. Próximas mejoras sugeridas

- Asociación formal `User ↔ Driver`.
- Permisos específicos para conductor.
- Mejoras PWA.
- Modo offline y sincronización posterior.
- App nativa Android/iOS.
- GPS continuo controlado con consentimiento y reglas operativas.
