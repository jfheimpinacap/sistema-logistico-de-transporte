"""CSV export for driver performance report."""
from apps.reports.services.drivers import get_driver_performance

from .csv_utils import build_csv_response

HEADERS = [
    "ID conductor", "Conductor", "Rutas total", "Rutas completadas", "Paradas total", "Paradas completadas", "Paradas fallidas",
    "Encomiendas asignadas", "Encomiendas entregadas", "Incidencias total", "Incidencias abiertas",
]


def export_driver_performance_csv(params):
    rows = (
        [
            row.get("driver_id"),
            row.get("driver_name"),
            row.get("routes_total"),
            row.get("routes_completed"),
            row.get("stops_total"),
            row.get("stops_completed"),
            row.get("stops_failed"),
            row.get("shipments_assigned"),
            row.get("shipments_delivered"),
            row.get("incidents_total"),
            row.get("incidents_open"),
        ]
        for row in get_driver_performance(params)["results"]
    )
    return build_csv_response("reporte_rendimiento_conductores", HEADERS, rows)
