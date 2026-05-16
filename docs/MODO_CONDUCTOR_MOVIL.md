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
- Existe una asociación base opcional `User ↔ Driver`: un usuario puede estar vinculado a un conductor, pero también pueden existir usuarios no conductores y conductores sin usuario asociado.


## 4. Usuario vinculado a conductor

- Un usuario autenticado puede estar asociado a un conductor mediante el perfil `driver_profile`.
- Si el usuario está asociado, `/driver` prioriza **Mis rutas** y consulta `GET /api/routes/my-routes/` para mostrar rutas asignadas a ese conductor.
- Si el usuario no está asociado a un conductor, el sistema conserva un modo demo/supervisor y muestra rutas disponibles para operación.
- El usuario demo conductor se crea con `python apps/backend/manage.py seed_demo_driver_user` y usa credenciales `conductor` / `conductor1234`.
- Conductores externos pueden operar desde web móvil con su propio vehículo; no se asume GPS instalado en todos los vehículos.
- La ubicación actual sigue siendo puntual, capturada por acción del usuario, no continua.

## 5. Ubicación

- La ubicación se captura de forma puntual desde el navegador.
- La captura ocurre solo cuando el conductor presiona **Capturar ubicación actual**.
- No es GPS en tiempo real.
- No hay tracking continuo todavía.
- Si el navegador no soporta geolocalización o el usuario deniega el permiso, los formularios pueden guardarse sin ubicación.

## 6. Fuera de alcance

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

## 7. Flujo de prueba

1. Ejecutar `py start.py prepare`.
2. Ejecutar `py start.py dev`.
3. Abrir `/login`.
4. Iniciar sesión con `conductor` / `conductor1234` para probar rutas filtradas por conductor, o con `demo` / `demo1234` para modo demo/supervisor.
5. Abrir `/driver` y validar la tarjeta de perfil conductor o el aviso de usuario sin conductor asociado.
6. Seleccionar una ruta disponible.
7. Iniciar ruta.
8. Revisar resumen, paradas y encomiendas.
9. Marcar llegada a una parada.
10. Marcar parada completada o fallida.
11. Registrar evidencia de entrega.
12. Registrar incidencia operativa.
13. Capturar ubicación puntual si se desea.
14. Completar ruta.

## 8. Próximas mejoras sugeridas

- Roles/permisos específicos para conductor.
- Administración completa de usuarios y vínculos conductor.
- Mejoras PWA.
- Modo offline y sincronización posterior.
- App nativa Android/iOS.
- GPS continuo controlado con consentimiento y reglas operativas.
