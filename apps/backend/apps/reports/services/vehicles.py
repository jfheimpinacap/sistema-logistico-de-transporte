"""Vehicle usage report service."""
from django.db.models import Sum

from apps.fieldops.models import Incident
from apps.fleet.models import Vehicle
from apps.routing.models import Route, RouteShipment

from .utils import apply_date_range, apply_exact_filter, apply_int_filter, decimal_to_float


def get_vehicle_usage(params) -> dict:
    """Return one usage row per vehicle."""
    vehicles = Vehicle.objects.select_related("vehicle_type")
    vehicles = apply_int_filter(vehicles, params, "vehicle", "id")
    vehicles = apply_int_filter(vehicles, params, "vehicle_type", "vehicle_type_id")
    routes = apply_date_range(Route.objects.all(), params, "route_date")
    routes = apply_exact_filter(routes, params, "status")

    results = []
    for vehicle in vehicles.order_by("plate_number", "id"):
        vehicle_routes = routes.filter(vehicle=vehicle)
        route_ids = vehicle_routes.values("id")
        assignments = RouteShipment.objects.filter(route_id__in=route_ids, is_active=True)
        shipment_weight = assignments.aggregate(total=Sum("shipment__total_weight_kg"))["total"]
        route_weight = vehicle_routes.aggregate(total=Sum("total_weight_kg"))["total"]
        results.append(
            {
                "vehicle_id": vehicle.id,
                "vehicle_plate": vehicle.plate_number,
                "vehicle_type_name": vehicle.vehicle_type.name if vehicle.vehicle_type_id else "",
                "routes_total": vehicle_routes.count(),
                "routes_completed": vehicle_routes.filter(status=Route.Status.COMPLETED).count(),
                "shipments_assigned": assignments.values("shipment_id").distinct().count(),
                "total_weight_kg": decimal_to_float(shipment_weight or route_weight),
                "incidents_total": Incident.objects.filter(vehicle=vehicle, route_id__in=route_ids).count(),
                "current_status": vehicle.status,
            }
        )
    return {"results": results, "total_vehicles": len(results)}
