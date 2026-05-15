"""Internal logistics document summary report service."""
from django.db.models import Count

from apps.documents.models import LogisticsDocument

from .utils import apply_bool_filter, apply_date_range, apply_exact_filter, apply_int_filter, count_by_field


def _base_queryset(params):
    queryset = apply_date_range(LogisticsDocument.objects.all(), params, "issue_date")
    queryset = apply_exact_filter(queryset, params, "document_type")
    queryset = apply_exact_filter(queryset, params, "status")
    queryset = apply_int_filter(queryset, params, "customer", "customer_id")
    queryset = apply_int_filter(queryset, params, "route", "route_id")
    queryset = apply_int_filter(queryset, params, "shipment", "shipment_id")
    return apply_bool_filter(queryset, params)


def get_documents_summary(params) -> dict:
    """Return document counts by type, status and issue date."""
    documents = _base_queryset(params)
    return {
        "total": documents.count(),
        "by_document_type": count_by_field(documents, "document_type", [value for value, _ in LogisticsDocument.DocumentType.choices]),
        "by_status": count_by_field(documents, "status", [value for value, _ in LogisticsDocument.Status.choices]),
        "issued": documents.filter(status=LogisticsDocument.Status.ISSUED).count(),
        "cancelled": documents.filter(status=LogisticsDocument.Status.CANCELLED).count(),
        "draft": documents.filter(status=LogisticsDocument.Status.DRAFT).count(),
        "by_issue_date": [
            {"date": row["issue_date"].isoformat(), "total": row["total"]}
            for row in documents.values("issue_date").annotate(total=Count("id")).order_by("issue_date")
        ],
    }
