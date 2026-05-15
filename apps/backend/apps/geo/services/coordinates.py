"""Coordinate validation and address formatting helpers."""
from decimal import Decimal, InvalidOperation


def _to_decimal(value):
    """Convert coordinate-like values to Decimal, returning None for invalid input."""
    if value is None or value == "":
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def is_valid_latitude(value) -> bool:
    """Return True when value is a latitude in the inclusive range -90..90."""
    latitude = _to_decimal(value)
    return latitude is not None and Decimal("-90") <= latitude <= Decimal("90")


def is_valid_longitude(value) -> bool:
    """Return True when value is a longitude in the inclusive range -180..180."""
    longitude = _to_decimal(value)
    return longitude is not None and Decimal("-180") <= longitude <= Decimal("180")


def coordinate_errors(latitude, longitude) -> list[str]:
    """Return human-readable validation errors for a latitude/longitude pair."""
    errors = []
    if latitude is None or latitude == "":
        errors.append("Latitud requerida.")
    elif not is_valid_latitude(latitude):
        errors.append("Latitud inválida: debe estar entre -90 y 90.")
    if longitude is None or longitude == "":
        errors.append("Longitud requerida.")
    elif not is_valid_longitude(longitude):
        errors.append("Longitud inválida: debe estar entre -180 y 180.")
    return errors


def has_valid_coordinates(address) -> bool:
    """Return True when an address object has usable latitude and longitude."""
    return bool(
        address
        and is_valid_latitude(getattr(address, "latitude", None))
        and is_valid_longitude(getattr(address, "longitude", None))
    )


def format_coordinates(latitude, longitude) -> str | None:
    """Format a coordinate pair with six decimal places or return None if invalid."""
    if coordinate_errors(latitude, longitude):
        return None
    return f"{float(latitude):.6f}, {float(longitude):.6f}"


def address_display(address) -> str:
    """Build a compact display string for an address without assuming all fields exist."""
    if not address:
        return "Sin dirección"
    parts = [
        getattr(address, "label", ""),
        " ".join(part for part in [getattr(address, "street", ""), getattr(address, "number", "")] if part).strip(),
        getattr(address, "commune", ""),
        getattr(address, "city", ""),
        getattr(address, "region", ""),
        getattr(address, "country", ""),
    ]
    return ", ".join(part for part in parts if part)
