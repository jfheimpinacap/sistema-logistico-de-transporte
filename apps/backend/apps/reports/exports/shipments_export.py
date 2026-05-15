"""CSV export for shipments report."""
from django.db.models import Count

from apps.logistics.models import Package
from apps.reports.services.shipments import _base_queryset

from .csv_utils import build_csv_response

HEADERS = [
    "Código tracking", "Referencia externa", "Cliente", "Remitente", "Destinatario", "Teléfono destinatario",
    "Estado", "Prioridad", "Tipo servicio", "Bultos declarados", "Bultos reales", "Peso total kg", "Volumen total m3",
    "Bodega origen", "Dirección origen", "Dirección destino", "Fecha solicitada entrega", "Recibida en", "Entregada en",
    "Activa", "Creada en",
]


def export_shipments_csv(params):
    shipments = _base_queryset(params).select_related("customer", "origin_warehouse", "origin_address", "destination_address")
    package_counts = {
        row["shipment_id"]: row["total"]
        for row in Package.objects.filter(shipment__in=shipments, is_active=True)
        .values("shipment_id")
        .order_by()
        .annotate(total=Count("id"))
    }
    rows = (
        [
            shipment.tracking_code,
            shipment.external_reference,
            shipment.customer.name if shipment.customer_id else "",
            shipment.sender_name,
            shipment.recipient_name,
            shipment.recipient_phone,
            shipment.get_current_status_display(),
            shipment.get_priority_display(),
            shipment.get_service_type_display(),
            shipment.package_count,
            package_counts.get(shipment.id, 0),
            shipment.total_weight_kg,
            shipment.total_volume_m3,
            shipment.origin_warehouse.name if shipment.origin_warehouse_id else "",
            shipment.origin_address,
            shipment.destination_address,
            shipment.requested_delivery_date,
            shipment.received_at,
            shipment.delivered_at,
            shipment.is_active,
            shipment.created_at,
        ]
        for shipment in shipments.order_by("-created_at", "-id")
    )
    return build_csv_response("reporte_encomiendas", HEADERS, rows)
