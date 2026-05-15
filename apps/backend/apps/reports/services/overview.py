"""Overview report service."""
from django.db.models import Count

from apps.documents.models import LogisticsDocument
from apps.fieldops.models import DeliveryProof, Incident
from apps.logistics.models import Shipment
from apps.routing.models import Route


def _count_status(queryset, field_name: str, statuses: list[str]) -> dict[str, int]:
    counts = {status: 0 for status in statuses}
    for row in queryset.values(field_name).annotate(total=Count("id")):
        counts[row[field_name]] = row["total"]
    return counts


def get_overview() -> dict:
    """Return a consolidated operational overview without mutating data."""
    shipment_statuses = _count_status(Shipment.objects.all(), "current_status", [value for value, _ in Shipment.Status.choices])
    route_statuses = _count_status(Route.objects.all(), "status", [value for value, _ in Route.Status.choices])
    incident_statuses = _count_status(Incident.objects.all(), "status", [value for value, _ in Incident.Status.choices])
    proof_statuses = _count_status(DeliveryProof.objects.all(), "status", [value for value, _ in DeliveryProof.Status.choices])
    document_statuses = _count_status(LogisticsDocument.objects.all(), "status", [value for value, _ in LogisticsDocument.Status.choices])

    return {
        "shipments": {
            "total": Shipment.objects.count(),
            "active": Shipment.objects.filter(is_active=True).count(),
            "received": shipment_statuses.get(Shipment.Status.RECEIVED, 0),
            "in_transit": shipment_statuses.get(Shipment.Status.IN_TRANSIT, 0),
            "delivered": shipment_statuses.get(Shipment.Status.DELIVERED, 0),
            "failed_delivery": shipment_statuses.get(Shipment.Status.FAILED_DELIVERY, 0),
            "returned": shipment_statuses.get(Shipment.Status.RETURNED, 0),
            "cancelled": shipment_statuses.get(Shipment.Status.CANCELLED, 0),
        },
        "routes": {
            "total": Route.objects.count(),
            "active": Route.objects.filter(is_active=True).count(),
            "planned": route_statuses.get(Route.Status.PLANNED, 0),
            "assigned": route_statuses.get(Route.Status.ASSIGNED, 0),
            "in_progress": route_statuses.get(Route.Status.IN_PROGRESS, 0),
            "completed": route_statuses.get(Route.Status.COMPLETED, 0),
            "with_incidents": route_statuses.get(Route.Status.WITH_INCIDENTS, 0),
            "cancelled": route_statuses.get(Route.Status.CANCELLED, 0),
        },
        "incidents": {
            "total": Incident.objects.count(),
            "open": incident_statuses.get(Incident.Status.OPEN, 0),
            "in_review": incident_statuses.get(Incident.Status.IN_REVIEW, 0),
            "resolved": incident_statuses.get(Incident.Status.RESOLVED, 0),
            "critical": Incident.objects.filter(severity=Incident.Severity.CRITICAL).count(),
        },
        "delivery_proofs": {
            "total": DeliveryProof.objects.count(),
            "pending_review": proof_statuses.get(DeliveryProof.Status.PENDING_REVIEW, 0),
            "accepted": proof_statuses.get(DeliveryProof.Status.ACCEPTED, 0),
            "rejected": proof_statuses.get(DeliveryProof.Status.REJECTED, 0),
        },
        "documents": {
            "total": LogisticsDocument.objects.count(),
            "draft": document_statuses.get(LogisticsDocument.Status.DRAFT, 0),
            "issued": document_statuses.get(LogisticsDocument.Status.ISSUED, 0),
            "cancelled": document_statuses.get(LogisticsDocument.Status.CANCELLED, 0),
            "archived": document_statuses.get(LogisticsDocument.Status.ARCHIVED, 0),
        },
    }
