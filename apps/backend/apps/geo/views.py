"""Authenticated diagnostic endpoints for internal georeferencing."""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer

from apps.geo.services.coordinates import address_display, coordinate_errors, format_coordinates, has_valid_coordinates
from apps.geo.services.distance import estimate_duration_minutes, haversine_distance_km
from apps.geo.services.route_metrics import LINEAR_WARNING, METHOD, calculate_route_distance_summary, update_route_estimates
from apps.locations.models import Address
from apps.routing.models import Route


def _parse_bool(value) -> bool:
    """Parse common truthy query values."""
    return str(value).strip().lower() in {"1", "true", "t", "yes", "y", "on"}


def _average_speed_from_payload(payload):
    """Return a positive average speed or an error response payload."""
    raw_speed = payload.get("average_speed_kmh", 35) if isinstance(payload, dict) else 35
    try:
        speed = float(raw_speed)
    except (TypeError, ValueError):
        return None, {"average_speed_kmh": "Debe ser un número positivo."}
    if speed <= 0:
        return None, {"average_speed_kmh": "Debe ser mayor que cero."}
    return speed, None


def _address_status(address):
    """Serialize coordinate diagnostic status for an address."""
    errors = coordinate_errors(address.latitude, address.longitude)
    has_any_coordinate = address.latitude is not None or address.longitude is not None
    status_label = "with_coordinates" if not errors else ("invalid_coordinates" if has_any_coordinate else "missing_coordinates")
    return {
        "id": address.id,
        "label": address.label,
        "display": address_display(address),
        "latitude": address.latitude,
        "longitude": address.longitude,
        "coordinates": format_coordinates(address.latitude, address.longitude),
        "has_valid_coordinates": has_valid_coordinates(address),
        "status": status_label,
        "errors": errors,
    }


class AddressCheckView(APIView):
    """List addresses with coordinate diagnostics."""

    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        """Return address coordinate status summary, optionally filtered."""
        queryset = Address.objects.select_related("zone").order_by("label", "id")
        address_id = request.query_params.get("address_id")
        if address_id:
            queryset = queryset.filter(id=address_id)
        address_items = [_address_status(address) for address in queryset]
        if _parse_bool(request.query_params.get("only_missing", "false")):
            address_items = [item for item in address_items if item["status"] != "with_coordinates"]

        all_items = [_address_status(address) for address in queryset]
        return Response(
            {
                "total_addresses": len(all_items),
                "with_coordinates": sum(1 for item in all_items if item["status"] == "with_coordinates"),
                "missing_coordinates": sum(1 for item in all_items if item["status"] == "missing_coordinates"),
                "invalid_coordinates": sum(1 for item in all_items if item["status"] == "invalid_coordinates"),
                "addresses": address_items,
            }
        )


class CalculateDistanceView(APIView):
    """Calculate a linear Haversine distance between two coordinate pairs."""

    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def post(self, request):
        """Validate payload and return distance/duration estimate."""
        origin = request.data.get("from") or {}
        destination = request.data.get("to") or {}
        errors = {}
        origin_errors = coordinate_errors(origin.get("latitude"), origin.get("longitude"))
        destination_errors = coordinate_errors(destination.get("latitude"), destination.get("longitude"))
        if origin_errors:
            errors["from"] = origin_errors
        if destination_errors:
            errors["to"] = destination_errors
        average_speed, average_speed_errors = _average_speed_from_payload(request.data)
        if average_speed_errors:
            errors.update(average_speed_errors)
        if errors:
            return Response({"detail": "Coordenadas inválidas.", "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        distance_km = haversine_distance_km(
            origin.get("latitude"),
            origin.get("longitude"),
            destination.get("latitude"),
            destination.get("longitude"),
        )
        return Response(
            {
                "distance_km": distance_km,
                "estimated_duration_minutes": estimate_duration_minutes(distance_km, average_speed),
                "method": METHOD,
                "warning": LINEAR_WARNING,
            }
        )


class RouteDistanceSummaryView(APIView):
    """Return a route's internal geo distance summary."""

    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get(self, request, route_id):
        """Calculate the summary without mutating the route."""
        route = Route.objects.filter(id=route_id).first()
        if not route:
            return Response({"detail": "Ruta no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        average_speed, average_speed_errors = _average_speed_from_payload({"average_speed_kmh": request.query_params.get("average_speed_kmh", 35)})
        if average_speed_errors:
            return Response({"detail": "Velocidad promedio inválida.", "errors": average_speed_errors}, status=status.HTTP_400_BAD_REQUEST)
        return Response(calculate_route_distance_summary(route, average_speed_kmh=average_speed))


class RouteUpdateEstimatesView(APIView):
    """Update route distance estimate fields using internal linear metrics."""

    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def post(self, request, route_id):
        """Calculate and persist estimated distance/duration without optimizing stops."""
        route = Route.objects.filter(id=route_id).first()
        if not route:
            return Response({"detail": "Ruta no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        average_speed, average_speed_errors = _average_speed_from_payload(request.data if isinstance(request.data, dict) else {})
        if average_speed_errors:
            return Response({"detail": "Velocidad promedio inválida.", "errors": average_speed_errors}, status=status.HTTP_400_BAD_REQUEST)
        summary = update_route_estimates(route, average_speed_kmh=average_speed)
        route.refresh_from_db()
        return Response(
            {
                "route_id": route.id,
                "route_code": route.route_code,
                "estimated_distance_km": route.estimated_distance_km,
                "estimated_duration_minutes": route.estimated_duration_minutes,
                "distance_summary": summary,
            }
        )
