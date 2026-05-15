"""Distance and duration estimation helpers based on standard Python only."""
from math import asin, cos, radians, sin, sqrt

from apps.geo.services.coordinates import coordinate_errors

EARTH_RADIUS_KM = 6371.0088


def haversine_distance_km(lat1, lon1, lat2, lon2):
    """Calculate linear great-circle distance in kilometers using Haversine."""
    errors = coordinate_errors(lat1, lon1) + coordinate_errors(lat2, lon2)
    if errors:
        return None
    lat1_rad, lon1_rad, lat2_rad, lon2_rad = map(lambda value: radians(float(value)), (lat1, lon1, lat2, lon2))
    delta_lat = lat2_rad - lat1_rad
    delta_lon = lon2_rad - lon1_rad
    haversine = sin(delta_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2) ** 2
    distance = 2 * EARTH_RADIUS_KM * asin(sqrt(haversine))
    return round(distance, 2)


def estimate_duration_minutes(distance_km, average_speed_kmh=35):
    """Estimate travel time in minutes from distance and average speed."""
    if distance_km is None:
        return None
    try:
        distance = float(distance_km)
        speed = float(average_speed_kmh)
    except (TypeError, ValueError):
        return None
    if distance < 0 or speed <= 0:
        return None
    return int(round((distance / speed) * 60))
