# Georreferenciación base

## Qué se implementó

El Prompt 020 agrega una base backend interna para trabajar con coordenadas en direcciones y rutas sin depender de servicios externos de mapas. La implementación queda enfocada en diagnóstico, validación y cálculo simple para preparar futuras integraciones geográficas.

Componentes principales:

- App Django interna `apps.geo`.
- Servicios de validación de latitud/longitud reutilizando `Address.latitude` y `Address.longitude`.
- Cálculo de distancia lineal con fórmula Haversine.
- Estimación básica de duración con velocidad promedio configurable.
- Resumen geográfico de rutas según el orden manual de sus paradas activas.
- Endpoints protegidos con JWT bajo `/api/geo/`.
- Comando idempotente `seed_demo_geo` para coordenadas demo de Santiago/Chile.

## Qué significa distancia Haversine

Haversine calcula la distancia de círculo máximo entre dos puntos de la Tierra usando sus coordenadas de latitud y longitud. En este proyecto se usa como una **estimación lineal** entre paradas consecutivas, útil para diagnóstico inicial y aproximaciones operativas simples.

## Limitaciones

Las métricas generadas por esta fase son aproximadas. No consideran:

- Calles reales ni sentido de tránsito.
- Tráfico.
- Horarios, ventanas de atención o restricciones operativas.
- Peajes.
- Cortes de ruta.
- Optimización automática.
- GPS en tiempo real.
- Geocodificación automática por API externa.

Existe una visualización esquemática interna en `/geo/map`, pero todavía no hay mapa real ni integración con Google Maps, Mapbox, OpenStreetMap, OSRM u OpenRouteService.

## Cómo cargar coordenadas demo

Ejecuta:

```bash
python apps/backend/manage.py seed_demo_geo
```

El comando busca direcciones existentes de demo asociadas a Santiago Centro, Providencia, Las Condes, Ñuñoa y Estación Central, y asigna coordenadas razonables solo cuando están vacías.

Para sobrescribir coordenadas existentes de direcciones coincidentes, usa explícitamente:

```bash
python apps/backend/manage.py seed_demo_geo --force
```

Por defecto no duplica direcciones, no borra datos y no sobrescribe coordenadas ya cargadas.

## Cómo revisar direcciones sin coordenadas

Con JWT válido:

```bash
curl "http://localhost:8002/api/geo/address-check/?only_missing=true" \
  -H "Authorization: Bearer <access_token>"
```

También puedes revisar una dirección específica:

```bash
curl "http://localhost:8002/api/geo/address-check/?address_id=1" \
  -H "Authorization: Bearer <access_token>"
```

## Cómo calcular una distancia simple

```bash
curl -X POST http://localhost:8002/api/geo/calculate-distance/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "from": {"latitude": -33.45, "longitude": -70.66},
    "to": {"latitude": -33.44, "longitude": -70.65},
    "average_speed_kmh": 35
  }'
```

## Cómo calcular resumen de distancia de una ruta

```bash
curl http://localhost:8002/api/geo/routes/1/distance-summary/ \
  -H "Authorization: Bearer <access_token>"
```

Para calcular y persistir los campos `estimated_distance_km` y `estimated_duration_minutes` de una ruta:

```bash
curl -X POST http://localhost:8002/api/geo/routes/1/update-estimates/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"average_speed_kmh": 35}'
```

La actualización no cambia el orden de paradas, no optimiza la ruta y no modifica estados operativos.

## Mapa esquemático interno

El Prompt 022 agrega `/geo/map`, una vista protegida de mapa técnico basada en SVG/HTML/CSS, sin dependencias nuevas y sin librerías de mapas. La pantalla permite seleccionar una ruta, configurar velocidad promedio, consultar el resumen de distancia, dibujar paradas con coordenadas, unirlas por segmentos lineales según secuencia, revisar etiquetas y seleccionar puntos para ver detalle.

La proyección convierte cada longitud en coordenada X y cada latitud en coordenada Y dentro del SVG. El eje Y se invierte: una latitud mayor se dibuja más arriba. El cálculo usa límites mínimos/máximos de las coordenadas disponibles, agrega padding para separar los puntos del borde y expande artificialmente rangos cuando hay un solo punto o coordenadas iguales. Los puntos sin latitud/longitud válida no se proyectan; se muestran en una lista aparte con la instrucción de completar latitud/longitud en **Maestros > Direcciones**.

La vista usa los endpoints existentes:

- `GET /api/routes/` para el selector de rutas.
- `GET /api/geo/routes/{route_id}/distance-summary/` para obtener segmentos y resumen Haversine.
- `POST /api/geo/routes/{route_id}/update-estimates/` para persistir estimaciones lineales.

### Limitaciones del mapa esquemático

- No es mapa de calles.
- No dibuja cartografía real.
- No usa Google Maps, Mapbox, OpenStreetMap, Leaflet ni servicios externos.
- No calcula recorridos por calles, tráfico, peajes ni restricciones.
- No optimiza el orden de las paradas.
- No reemplaza GPS ni tracking en tiempo real.

Conviene pasar a mapas reales cuando el sistema necesite navegación operativa sobre calles, cálculo de ETA por tráfico, restricciones por tipo de vehículo, geocodificación automática, optimización de paradas o visualización cartográfica precisa para usuarios finales.

## Queda para fases posteriores
- Geocodificación real por API externa.
- Cálculo por calles reales.
- Optimización automática de rutas.
- Tráfico.
- GPS en tiempo real.

## Vista frontend `/geo`

El Prompt 021 agrega una vista protegida en el frontend para usar los endpoints internos de georreferenciación sin incorporar mapas externos ni librerías adicionales. La vista está disponible después del login en:

```text
/geo
```

La pantalla muestra siempre una advertencia visible: las distancias son lineales estimadas con fórmula Haversine y no consideran calles, tráfico, restricciones, sentido de tránsito ni peajes.

### Cómo revisar direcciones desde la UI

1. Ejecuta `py start.py prepare` para preparar datos demo, incluyendo coordenadas base cuando corresponde.
2. Ejecuta `py start.py dev` para levantar backend y frontend.
3. Abre `/login` e ingresa con usuario `demo` y password `demo1234`.
4. Abre `/geo` desde la barra lateral o escribiendo la ruta directamente.
5. Revisa las tarjetas de resumen: total de direcciones, con coordenadas, sin coordenadas e inválidas.
6. Usa los filtros **Todas** y **Solo sin coordenadas** para alternar el listado diagnóstico.

Si una dirección aparece sin coordenadas o con valores inválidos, corrige latitud/longitud desde **Maestros > Direcciones** antes de confiar en los cálculos de ruta.

### Cómo probar la calculadora Haversine

En la sección **Distancia entre dos puntos**:

1. Ingresa latitud/longitud de origen.
2. Ingresa latitud/longitud de destino.
3. Ajusta la velocidad promedio en km/h si necesitas otra estimación.
4. Presiona **Calcular distancia**.
5. Revisa distancia en kilómetros, duración estimada, método y advertencia.

La calculadora valida rangos básicos: latitud entre -90 y 90, longitud entre -180 y 180 y velocidad mayor que cero. Los errores 400 del backend se muestran como mensajes legibles.

### Cómo revisar y actualizar estimaciones de ruta

En la sección **Resumen de distancia de ruta**:

1. Selecciona una ruta disponible.
2. Ajusta la velocidad promedio en km/h.
3. Presiona **Ver resumen** para consultar `/api/geo/routes/{route_id}/distance-summary/` sin persistir cambios.
4. Revisa paradas totales, paradas con coordenadas, distancia total, duración estimada y segmentos entre paradas.
5. Si hay paradas sin coordenadas, la vista muestra la sugerencia: “Completa latitud/longitud en Maestros > Direcciones para mejorar el cálculo.”
6. Presiona **Actualizar estimaciones de ruta** para llamar `/api/geo/routes/{route_id}/update-estimates/` y persistir `estimated_distance_km` y `estimated_duration_minutes` en la ruta.

La actualización no optimiza el orden de paradas, no usa calles reales y no cambia estados operativos. Solo recalcula estimaciones lineales con el orden manual existente.

## Pendiente para próximas fases

- Geocodificación real por API externa.
- Cálculo por calles reales con motor de rutas.
- Optimización automática de paradas.
- Tráfico, peajes y restricciones avanzadas.
- GPS en tiempo real o tracking continuo.
