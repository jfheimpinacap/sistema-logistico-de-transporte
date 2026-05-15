"""Shared helpers for read-only report aggregations."""
from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Iterable

from django.db.models import Count, QuerySet
from django.utils.dateparse import parse_date
from rest_framework.exceptions import ValidationError

TRUE_VALUES = {"1", "true", "t", "yes", "y", "on"}
FALSE_VALUES = {"0", "false", "f", "no", "n", "off"}


def parse_iso_date_param(params, name: str) -> date | None:
    """Parse a YYYY-MM-DD query parameter or raise a clear API error."""
    value = params.get(name)
    if not value:
        return None
    parsed = parse_date(value)
    if parsed is None:
        raise ValidationError({name: "Formato inválido. Usa YYYY-MM-DD."})
    return parsed


def parse_int_param(params, name: str) -> int | None:
    """Parse an optional integer query parameter or raise a clear API error."""
    value = params.get(name)
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        raise ValidationError({name: "Debe ser un ID numérico válido."})


def parse_bool_param(params, name: str = "is_active") -> bool | None:
    """Parse a permissive boolean query parameter or raise a clear API error."""
    value = params.get(name)
    if value in (None, ""):
        return None
    normalized = str(value).strip().lower()
    if normalized in TRUE_VALUES:
        return True
    if normalized in FALSE_VALUES:
        return False
    raise ValidationError({name: "Debe ser booleano: true/false, 1/0, yes/no."})


def apply_date_range(queryset: QuerySet, params, field_name: str) -> QuerySet:
    """Apply date_from/date_to filters to date or datetime fields."""
    date_from = parse_iso_date_param(params, "date_from")
    date_to = parse_iso_date_param(params, "date_to")
    if date_from and date_to and date_from > date_to:
        raise ValidationError({"date_to": "Debe ser mayor o igual a date_from."})
    if date_from:
        queryset = queryset.filter(**{f"{field_name}__gte": date_from})
    if date_to:
        queryset = queryset.filter(**{f"{field_name}__lte": date_to})
    return queryset


def apply_datetime_date_range(queryset: QuerySet, params, field_name: str) -> QuerySet:
    """Apply date_from/date_to filters to a DateTimeField by its date part."""
    date_from = parse_iso_date_param(params, "date_from")
    date_to = parse_iso_date_param(params, "date_to")
    if date_from and date_to and date_from > date_to:
        raise ValidationError({"date_to": "Debe ser mayor o igual a date_from."})
    if date_from:
        queryset = queryset.filter(**{f"{field_name}__date__gte": date_from})
    if date_to:
        queryset = queryset.filter(**{f"{field_name}__date__lte": date_to})
    return queryset


def apply_int_filter(queryset: QuerySet, params, param_name: str, field_name: str | None = None) -> QuerySet:
    """Apply an integer ID filter only when provided."""
    parsed = parse_int_param(params, param_name)
    if parsed is None:
        return queryset
    return queryset.filter(**{field_name or f"{param_name}_id": parsed})


def apply_exact_filter(queryset: QuerySet, params, param_name: str, field_name: str | None = None) -> QuerySet:
    """Apply a string exact filter only when provided."""
    value = params.get(param_name)
    if not value:
        return queryset
    return queryset.filter(**{field_name or param_name: value})


def apply_bool_filter(queryset: QuerySet, params, field_name: str = "is_active") -> QuerySet:
    """Apply an is_active-style boolean filter only when provided."""
    parsed = parse_bool_param(params, field_name)
    if parsed is None:
        return queryset
    return queryset.filter(**{field_name: parsed})


def count_by_field(queryset: QuerySet, field_name: str, expected_values: Iterable[str] = ()) -> dict[str, int]:
    """Return stable counts by a model field, filling missing expected values with zero."""
    counts = {value: 0 for value in expected_values}
    for row in queryset.values(field_name).annotate(total=Count("id")).order_by(field_name):
        counts[row[field_name] or ""] = row["total"]
    return counts


def decimal_to_float(value) -> float:
    """Serialize Decimal/None values as stable JSON numbers."""
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)
