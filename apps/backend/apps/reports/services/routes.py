"""Route summary report service."""
from django.db.models import Count

from apps.fieldops.models import Incident
from apps.routing.models import Route, RouteShipment, RouteStop

from .utils import apply_bool_filter, apply_date_range, apply_exact_filter, apply_int_filter, count_by_field


def _base_queryset(params):
    queryset = apply_date_range(Route.objects.all(), params, "route_date")
    queryset = apply_int_filter(queryset, params, "driver", "driver_id")
    queryset = apply_int_filter(queryset, params, "vehicle", "vehicle_id")
    queryset = apply_int_filter(queryset, params, "origin_warehouse", "origin_warehouse_id")
    queryset = apply_exact_filter(queryset, params, "status")
    return apply_bool_filter(queryset, params)


def get_routes_summary(params) -> dict:
    """Return route, stop and assignment aggregates."""
    routes = _base_queryset(params)
    route_ids = routes.values("id")
    stops = RouteStop.objects.filter(route_id__in=route_ids, is_active=True)
    assignments = RouteShipment.objects.filter(route_id__in=route_ids, is_active=True)

    return {
        "total": routes.count(),
        "by_status": count_by_field(routes, "status", [value for value, _ in Route.Status.choices]),
        "by_date": [
            {"date": row["route_date"].isoformat(), "total": row["total"]}
            for row in routes.values("route_date").annotate(total=Count("id")).order_by("route_date")
        ],
        "in_progress": routes.filter(status=Route.Status.IN_PROGRESS).count(),
        "completed": routes.filter(status=Route.Status.COMPLETED).count(),
        "with_incidents": routes.filter(id__in=Incident.objects.filter(route_id__isnull=False).values("route_id")).distinct().count(),
        "shipments_assigned": assignments.values("shipment_id").distinct().count(),
        "stops_total": stops.count(),
        "stops_completed": stops.filter(status=RouteStop.Status.COMPLETED).count(),
        "stops_failed": stops.filter(status=RouteStop.Status.FAILED).count(),
    }
