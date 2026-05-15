"""Driver performance report service."""
from apps.fieldops.models import Incident
from apps.fleet.models import Driver
from apps.logistics.models import Shipment
from apps.routing.models import Route, RouteShipment, RouteStop

from .utils import apply_date_range, apply_exact_filter, apply_int_filter


def get_driver_performance(params) -> dict:
    """Return one performance row per driver."""
    drivers = Driver.objects.all()
    drivers = apply_int_filter(drivers, params, "driver", "id")
    routes = apply_date_range(Route.objects.all(), params, "route_date")
    routes = apply_exact_filter(routes, params, "status")

    results = []
    for driver in drivers.order_by("last_name", "first_name", "id"):
        driver_routes = routes.filter(driver=driver)
        route_ids = driver_routes.values("id")
        stops = RouteStop.objects.filter(route_id__in=route_ids, is_active=True)
        assignments = RouteShipment.objects.filter(route_id__in=route_ids, is_active=True)
        incidents = Incident.objects.filter(driver=driver, route_id__in=route_ids)
        results.append(
            {
                "driver_id": driver.id,
                "driver_name": str(driver),
                "routes_total": driver_routes.count(),
                "routes_completed": driver_routes.filter(status=Route.Status.COMPLETED).count(),
                "stops_total": stops.count(),
                "stops_completed": stops.filter(status=RouteStop.Status.COMPLETED).count(),
                "stops_failed": stops.filter(status=RouteStop.Status.FAILED).count(),
                "shipments_assigned": assignments.values("shipment_id").distinct().count(),
                "shipments_delivered": assignments.filter(shipment__current_status=Shipment.Status.DELIVERED).values("shipment_id").distinct().count(),
                "incidents_total": incidents.count(),
                "incidents_open": incidents.filter(status=Incident.Status.OPEN).count(),
            }
        )
    return {"results": results, "total_drivers": len(results)}
