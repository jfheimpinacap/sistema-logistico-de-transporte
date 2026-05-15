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

Tampoco existe aún frontend de mapa visual ni integración con Google Maps, Mapbox, OpenStreetMap, OSRM u OpenRouteService.

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

## Queda para fases posteriores

- Frontend geográfico y mapa visual.
- Geocodificación real por API externa.
- Cálculo por calles reales.
- Optimización automática de rutas.
- Tráfico.
- GPS en tiempo real.
