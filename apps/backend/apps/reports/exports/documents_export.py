"""CSV export for internal logistics documents report."""
from apps.reports.services.documents import _base_queryset

from .csv_utils import build_csv_response

HEADERS = [
    "Número documento", "Tipo", "Estado", "Título", "Fecha emisión", "Ruta", "Encomienda", "Cliente", "Bodega", "Conductor",
    "Vehículo", "Total encomiendas", "Total bultos", "Peso kg", "Volumen m3", "Referencia externa", "Referencia SII manual",
    "Activo", "Creado en",
]


def export_documents_csv(params):
    documents = _base_queryset(params).select_related("route", "shipment", "customer", "warehouse", "driver", "vehicle")
    rows = (
        [
            document.document_number,
            document.get_document_type_display(),
            document.get_status_display(),
            document.title,
            document.issue_date,
            document.route.route_code if document.route_id else document.route_code_snapshot,
            document.shipment.tracking_code if document.shipment_id else document.shipment_tracking_code_snapshot,
            document.customer.name if document.customer_id else document.customer_name_snapshot,
            document.warehouse.name if document.warehouse_id else "",
            document.driver if document.driver_id else document.driver_name_snapshot,
            document.vehicle if document.vehicle_id else document.vehicle_plate_snapshot,
            document.total_shipments,
            document.total_packages,
            document.total_weight_kg,
            document.total_volume_m3,
            document.external_reference,
            document.sii_reference,
            document.is_active,
            document.created_at,
        ]
        for document in documents.order_by("-issue_date", "-created_at", "-id")
    )
    return build_csv_response("reporte_documentos", HEADERS, rows)
