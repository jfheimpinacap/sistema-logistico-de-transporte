"""CSV export for vehicle usage report."""
from apps.reports.services.vehicles import get_vehicle_usage

from .csv_utils import build_csv_response

HEADERS = [
    "ID vehículo", "Patente", "Tipo vehículo", "Rutas total", "Rutas completadas", "Encomiendas asignadas", "Peso total kg",
    "Incidencias total", "Estado actual",
]


def export_vehicle_usage_csv(params):
    rows = (
        [
            row.get("vehicle_id"),
            row.get("vehicle_plate"),
            row.get("vehicle_type_name"),
            row.get("routes_total"),
            row.get("routes_completed"),
            row.get("shipments_assigned"),
            row.get("total_weight_kg"),
            row.get("incidents_total"),
            row.get("current_status"),
        ]
        for row in get_vehicle_usage(params)["results"]
    )
    return build_csv_response("reporte_uso_vehiculos", HEADERS, rows)
