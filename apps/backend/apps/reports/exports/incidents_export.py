"""CSV export for incidents report."""
from apps.reports.services.incidents import _base_queryset

from .csv_utils import build_csv_response

HEADERS = [
    "Código incidencia", "Categoría", "Severidad", "Estado", "Título", "Descripción", "Encomienda", "Ruta", "Parada",
    "Conductor", "Vehículo", "Ubicación", "Ocurrida en", "Resuelta en", "Reportada por", "Resuelta por", "Activa", "Creada en",
]


def export_incidents_csv(params):
    incidents = _base_queryset(params).select_related(
        "shipment", "route", "route_stop", "driver", "vehicle", "reported_by", "resolved_by"
    )
    rows = (
        [
            incident.incident_code,
            incident.get_category_display(),
            incident.get_severity_display(),
            incident.get_status_display(),
            incident.title,
            incident.description,
            incident.shipment.tracking_code if incident.shipment_id else "",
            incident.route.route_code if incident.route_id else "",
            incident.route_stop,
            incident.driver,
            incident.vehicle,
            incident.location_text,
            incident.occurred_at,
            incident.resolved_at,
            incident.reported_by.get_username() if incident.reported_by_id else "",
            incident.resolved_by.get_username() if incident.resolved_by_id else "",
            incident.is_active,
            incident.created_at,
        ]
        for incident in incidents.order_by("-occurred_at", "-created_at", "-id")
    )
    return build_csv_response("reporte_incidencias", HEADERS, rows)
