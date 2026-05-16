"""Route distance summary services for ordered stops."""
from decimal import Decimal

from apps.geo.services.coordinates import address_display, has_valid_coordinates
from apps.geo.services.distance import estimate_duration_minutes, haversine_distance_km

METHOD = "haversine_linear_estimate"
LINEAR_WARNING = "Distancia lineal estimada; no considera calles, tráfico ni restricciones."


def get_route_ordered_stops(route):
    """Return active route stops ordered by manual sequence."""
    return route.stops.filter(is_active=True).select_related("address").order_by("sequence", "id")


def get_route_stop_coordinates(stop):
    """Return a dict with stop coordinates when valid, otherwise None."""
    address = getattr(stop, "address", None)
    if not has_valid_coordinates(address):
        return None
    return {"latitude": float(address.latitude), "longitude": float(address.longitude)}


def _stop_payload(stop):
    """Serialize minimal stop data for geo diagnostic responses."""
    coordinates = get_route_stop_coordinates(stop)
    return {
        "stop_id": stop.id,
        "sequence": stop.sequence,
        "address_id": stop.address_id,
        "address_label": stop.address.label if stop.address else None,
        "address_display": address_display(stop.address),
        "coordinates": coordinates,
    }


def calculate_route_distance_summary(route, average_speed_kmh=35):
    """Calculate a linear distance summary for a route's consecutive stops."""
    stops = list(get_route_ordered_stops(route))
    segments = []
    warnings = [LINEAR_WARNING]
    distance_total = Decimal("0.00")
    stops_with_coordinates = 0

    for stop in stops:
        if get_route_stop_coordinates(stop):
            stops_with_coordinates += 1

    for origin, destination in zip(stops, stops[1:]):
        origin_coordinates = get_route_stop_coordinates(origin)
        destination_coordinates = get_route_stop_coordinates(destination)
        segment = {
            "from_stop": _stop_payload(origin),
            "to_stop": _stop_payload(destination),
            "distance_km": None,
            "estimated_duration_minutes": None,
            "method": METHOD,
            "warning": None,
        }
        if not origin_coordinates or not destination_coordinates:
            segment["warning"] = "No se calcula el tramo porque una o ambas paradas no tienen coordenadas válidas."
            if segment["warning"] not in warnings:
                warnings.append(segment["warning"])
        else:
            distance_km = haversine_distance_km(
                origin_coordinates["latitude"],
                origin_coordinates["longitude"],
                destination_coordinates["latitude"],
                destination_coordinates["longitude"],
            )
            segment["distance_km"] = distance_km
            segment["estimated_duration_minutes"] = estimate_duration_minutes(distance_km, average_speed_kmh)
            distance_total += Decimal(str(distance_km or 0))
        segments.append(segment)

    distance_km = round(float(distance_total), 2)
    return {
        "route_id": route.id,
        "route_code": route.route_code,
        "stops_total": len(stops),
        "stops_with_coordinates": stops_with_coordinates,
        "stops_missing_coordinates": len(stops) - stops_with_coordinates,
        "stops": [_stop_payload(stop) for stop in stops],
        "distance_km": distance_km,
        "estimated_duration_minutes": estimate_duration_minutes(distance_km, average_speed_kmh),
        "segments": segments,
        "warnings": warnings,
        "method": METHOD,
    }


def update_route_estimates(route, average_speed_kmh=35):
    """Update route estimated distance/duration fields from linear stop metrics."""
    summary = calculate_route_distance_summary(route, average_speed_kmh=average_speed_kmh)
    route.estimated_distance_km = Decimal(str(summary["distance_km"]))
    route.estimated_duration_minutes = summary["estimated_duration_minutes"]
    route.save(update_fields=["estimated_distance_km", "estimated_duration_minutes", "updated_at"])
    return summary
