"""CSV export for routes report."""
from apps.reports.services.routes import _base_queryset

from .csv_utils import build_csv_response

HEADERS = [
    "Código ruta", "Nombre", "Fecha ruta", "Estado", "Bodega origen", "Conductor", "Vehículo", "Inicio planificado",
    "Fin planificado", "Inicio real", "Fin real", "Encomiendas", "Bultos", "Peso kg", "Volumen m3", "Distancia estimada km",
    "Duración estimada min", "Activa", "Creada en",
]


def export_routes_csv(params):
    routes = _base_queryset(params).select_related("origin_warehouse", "driver", "vehicle")
    rows = (
        [
            route.route_code,
            route.name,
            route.route_date,
            route.get_status_display(),
            route.origin_warehouse.name if route.origin_warehouse_id else "",
            route.driver,
            route.vehicle,
            route.planned_start_time,
            route.planned_end_time,
            route.actual_start_time,
            route.actual_end_time,
            route.total_shipments,
            route.total_packages,
            route.total_weight_kg,
            route.total_volume_m3,
            route.estimated_distance_km,
            route.estimated_duration_minutes,
            route.is_active,
            route.created_at,
        ]
        for route in routes.order_by("-route_date", "route_code")
    )
    return build_csv_response("reporte_rutas", HEADERS, rows)
