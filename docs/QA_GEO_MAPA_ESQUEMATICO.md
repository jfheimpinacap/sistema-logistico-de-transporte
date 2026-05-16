# QA visual — Mapa esquemático interno

## 1. Objetivo

Validar que `/geo/map` funciona como visualización esquemática interna para rutas logísticas, usando SVG y datos geográficos propios del sistema.

## 2. Alcance

- Visualización SVG del mapa esquemático.
- Paradas con coordenadas válidas.
- Segmentos lineales entre paradas consecutivas.
- Paradas sin coordenadas o con coordenadas inválidas.
- Actualización de estimaciones lineales de ruta.
- Estados visuales de carga, error, vacío y éxito.
- Uso responsive básico en escritorio, tablet y móvil.

## 3. Fuera de alcance

- Mapa real o cartografía de calles.
- Calles, sentido de tránsito, restricciones, tráfico o peajes.
- Optimización automática de rutas.
- GPS en tiempo real o tracking continuo.
- Geocodificación automática real.
- Google Maps, Mapbox, OpenStreetMap, Leaflet, OSRM u OpenRouteService.

## 4. Preparación

1. Ejecutar `py start.py prepare`.
2. Ejecutar `py start.py dev`.
3. Iniciar sesión con usuario `demo` y contraseña `demo1234`.
4. Abrir `/geo/map` desde el navegador.
5. Confirmar que la advertencia de Haversine lineal está visible antes de validar resultados.

## 5. Casos de prueba visual

- [ ] Ruta sin paradas.
  - Debe mostrar “Esta ruta aún no tiene paradas para visualizar.”
  - No debe renderizar un SVG vacío confuso.
- [ ] Ruta con una parada.
  - Debe mostrar el punto centrado si tiene coordenadas válidas.
  - Debe indicar que no hay segmentos porque se requiere al menos dos paradas.
  - No debe mostrar `NaN` ni `Infinity`.
- [ ] Ruta con dos paradas.
  - Debe mostrar ambos puntos.
  - Debe unirlos con una línea.
  - Debe mostrar secuencia 1 y 2.
  - Debe mostrar un segmento lineal.
- [ ] Ruta con muchas paradas.
  - Debe mantener legibilidad general.
  - Debe activar etiquetas compactas o permitir ocultarlas si se superponen.
- [ ] Ruta con coordenadas faltantes.
  - Debe dibujar solo puntos válidos.
  - Debe listar paradas faltantes.
  - Debe sugerir completar coordenadas en **Maestros > Direcciones**.
- [ ] Ruta con coordenadas iguales.
  - Debe evitar rangos cero.
  - Debe separar visualmente puntos solapados cuando sea posible.
- [ ] Ruta con puntos muy cercanos.
  - Debe aplicar separación visual mínima y no romper el SVG.
- [ ] Ruta con coordenadas inválidas.
  - Debe excluir puntos inválidos del SVG.
  - Debe mostrarlos como pendientes de corrección.
- [ ] Selector de ruta.
  - Debe cargar rutas activas y limpiar el mapa al cambiar selección.
- [ ] Cambio de velocidad promedio.
  - Debe validar valores mayores que cero.
  - Debe recalcular al consultar o actualizar.
- [ ] Actualización de estimaciones.
  - Debe mostrar mensaje de éxito o error legible.
- [ ] Detalle de punto.
  - Debe abrirse al seleccionar un punto del mapa.
- [ ] Lista de segmentos.
  - Debe explicar si no hay segmentos disponibles.
- [ ] Lista de paradas sin coordenadas.
  - Debe ser legible y con scroll si hay muchos elementos.
- [ ] Vista responsive.
  - El SVG no debe desbordar horizontalmente.
  - Botones, selector y velocidad deben ser usables en móvil.
- [ ] Mensajes de error.
  - Deben ser claros ante sesión expirada, backend caído o datos inválidos.
- [ ] Advertencia Haversine visible.
  - Debe aclarar “Distancia lineal estimada” y “No es mapa de calles”.

## 6. Criterio de aprobación

- No hay errores bloqueantes.
- No hay SVG roto.
- No hay valores `NaN` o `Infinity` visibles.
- Se entienden las limitaciones del mapa esquemático.
- La UI es usable en desktop y móvil.
- Las paradas sin coordenadas o inválidas no se tratan como `(0, 0)`.
- La actualización de estimaciones no cambia el orden de paradas ni estados operativos.

## 7. Observaciones

- Hallazgo:
- Severidad:
- Ruta probada:
- Resolución sugerida:
- Responsable:
