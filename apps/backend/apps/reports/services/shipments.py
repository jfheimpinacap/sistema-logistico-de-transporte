"""Shipment summary report service."""
from django.db.models import Sum
from django.utils import timezone

from apps.logistics.models import Package, Shipment

from .utils import (
    apply_bool_filter,
    apply_datetime_date_range,
    apply_exact_filter,
    apply_int_filter,
    count_by_field,
    decimal_to_float,
)


def _base_queryset(params):
    queryset = apply_datetime_date_range(Shipment.objects.all(), params, "created_at")
    queryset = apply_int_filter(queryset, params, "customer", "customer_id")
    queryset = apply_exact_filter(queryset, params, "current_status")
    queryset = apply_exact_filter(queryset, params, "priority")
    queryset = apply_exact_filter(queryset, params, "service_type")
    return apply_bool_filter(queryset, params)


def get_shipments_summary(params) -> dict:
    """Return shipment, package, weight and volume aggregates."""
    shipments = _base_queryset(params)
    package_totals = Package.objects.filter(shipment__in=shipments, is_active=True).aggregate(
        total_weight=Sum("weight_kg"),
        total_volume=Sum("volume_m3"),
    )
    shipment_totals = shipments.aggregate(total_weight=Sum("total_weight_kg"), total_volume=Sum("total_volume_m3"))
    today = timezone.localdate()

    return {
        "total": shipments.count(),
        "by_current_status": count_by_field(shipments, "current_status", [value for value, _ in Shipment.Status.choices]),
        "by_priority": count_by_field(shipments, "priority", [value for value, _ in Shipment.Priority.choices]),
        "by_service_type": count_by_field(shipments, "service_type", [value for value, _ in Shipment.ServiceType.choices]),
        "packages_total": Package.objects.filter(shipment__in=shipments, is_active=True).count(),
        "estimated_weight_kg": decimal_to_float(package_totals["total_weight"] or shipment_totals["total_weight"]),
        "estimated_volume_m3": decimal_to_float(package_totals["total_volume"] or shipment_totals["total_volume"]),
        "delivered_today": shipments.filter(delivered_at__date=today).count(),
        "failed_today": shipments.filter(current_status=Shipment.Status.FAILED_DELIVERY, updated_at__date=today).count(),
    }
