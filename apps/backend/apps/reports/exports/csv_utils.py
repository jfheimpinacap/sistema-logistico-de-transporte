"""Common helpers for Excel-compatible CSV exports."""
from __future__ import annotations

import csv
import io
from datetime import date, datetime
from decimal import Decimal
from typing import Iterable, Sequence

from django.http import HttpResponse
from django.utils import timezone

DANGEROUS_PREFIXES = ("=", "+", "-", "@")


def clean_csv_value(value):
    """Normalize Python values into safe CSV cells for spreadsheet software."""
    if value is None:
        return ""
    if isinstance(value, bool):
        return "Sí" if value else "No"
    if isinstance(value, datetime):
        if timezone.is_aware(value):
            value = timezone.localtime(value)
        return value.strftime("%Y-%m-%d %H:%M:%S")
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, Decimal):
        return format(value, "f")
    text = str(value)
    if text.startswith(DANGEROUS_PREFIXES):
        return f"'{text}"
    return text


def build_csv_response(filename_prefix: str, headers: Sequence[str], rows: Iterable[Sequence[object]]) -> HttpResponse:
    """Build a UTF-8 BOM CSV HttpResponse with timestamped attachment filename."""
    buffer = io.StringIO()
    buffer.write("\ufeff")
    writer = csv.writer(buffer)
    writer.writerow([clean_csv_value(header) for header in headers])
    for row in rows:
        writer.writerow([clean_csv_value(value) for value in row])

    timestamp = timezone.localtime(timezone.now()).strftime("%Y-%m-%d_%H%M")
    filename = f"{filename_prefix}_{timestamp}.csv"
    response = HttpResponse(buffer.getvalue(), content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response
