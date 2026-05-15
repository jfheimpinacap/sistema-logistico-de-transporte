"""Incident summary report service."""
from django.db.models import Count

from apps.fieldops.models import Incident

from .utils import (
    apply_bool_filter,
    apply_datetime_date_range,
    apply_exact_filter,
    apply_int_filter,
    count_by_field,
)


def _base_queryset(params):
    queryset = apply_datetime_date_range(Incident.objects.all(), params, "occurred_at")
    queryset = apply_exact_filter(queryset, params, "category")
    queryset = apply_exact_filter(queryset, params, "severity")
    queryset = apply_exact_filter(queryset, params, "status")
    queryset = apply_int_filter(queryset, params, "driver", "driver_id")
    queryset = apply_int_filter(queryset, params, "vehicle", "vehicle_id")
    return apply_bool_filter(queryset, params)


def _average_resolution_hours(incidents) -> float | None:
    resolved = incidents.filter(resolved_at__isnull=False)
    total_seconds = 0.0
    total = 0
    for incident in resolved.only("occurred_at", "resolved_at"):
        total_seconds += (incident.resolved_at - incident.occurred_at).total_seconds()
        total += 1
    if not total:
        return None
    return round(total_seconds / total / 3600, 2)


def _top_drivers(incidents) -> list[dict]:
    """Return the drivers with most incidents in the filtered set."""
    rows = (
        incidents.filter(driver_id__isnull=False)
        .values("driver_id", "driver__first_name", "driver__last_name")
        .annotate(total=Count("id"))
        .order_by("-total", "driver__last_name")[:5]
    )
    return [
        {
            "driver_id": row["driver_id"],
            "driver_name": f"{row['driver__first_name']} {row['driver__last_name']}".strip(),
            "total": row["total"],
        }
        for row in rows
    ]


def get_incidents_summary(params) -> dict:
    """Return incident aggregates and simple top rankings."""
    incidents = _base_queryset(params)
    return {
        "total": incidents.count(),
        "by_status": count_by_field(incidents, "status", [value for value, _ in Incident.Status.choices]),
        "by_category": count_by_field(incidents, "category", [value for value, _ in Incident.Category.choices]),
        "by_severity": count_by_field(incidents, "severity", [value for value, _ in Incident.Severity.choices]),
        "open": incidents.filter(status=Incident.Status.OPEN).count(),
        "critical": incidents.filter(severity=Incident.Severity.CRITICAL).count(),
        "resolved": incidents.filter(status=Incident.Status.RESOLVED).count(),
        "average_resolution_hours": _average_resolution_hours(incidents),
        "top_drivers": _top_drivers(incidents),
        "top_vehicles": [
            {"vehicle_id": row["vehicle_id"], "vehicle_plate": row["vehicle__plate_number"], "total": row["total"]}
            for row in incidents.filter(vehicle_id__isnull=False)
            .values("vehicle_id", "vehicle__plate_number")
            .annotate(total=Count("id"))
            .order_by("-total", "vehicle__plate_number")[:5]
        ],
    }
