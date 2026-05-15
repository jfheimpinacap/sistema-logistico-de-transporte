"""Django admin registration for internal logistics documents."""
from django.contrib import admin

from apps.documents.models import LogisticsDocument, LogisticsDocumentLine


class LogisticsDocumentLineInline(admin.TabularInline):
    """Inline document lines."""

    model = LogisticsDocumentLine
    extra = 0
    fields = ("line_number", "shipment", "package", "route_stop", "description", "quantity", "weight_kg", "volume_m3", "is_active")


@admin.register(LogisticsDocument)
class LogisticsDocumentAdmin(admin.ModelAdmin):
    """Admin for internal logistics documents."""

    list_display = ("document_number", "document_type", "status", "issue_date", "route", "shipment", "customer", "is_active")
    list_filter = ("document_type", "status", "issue_date", "is_active", "warehouse")
    search_fields = (
        "document_number",
        "title",
        "description",
        "external_reference",
        "sii_reference",
        "route_code_snapshot",
        "shipment_tracking_code_snapshot",
        "customer_name_snapshot",
    )
    readonly_fields = ("created_at", "updated_at", "issued_at", "cancelled_at", "archived_at")
    inlines = [LogisticsDocumentLineInline]


@admin.register(LogisticsDocumentLine)
class LogisticsDocumentLineAdmin(admin.ModelAdmin):
    """Admin for internal logistics document lines."""

    list_display = ("document", "line_number", "shipment", "package", "reference_code", "quantity", "is_active")
    list_filter = ("is_active", "document__document_type")
    search_fields = ("document__document_number", "description", "reference_code", "notes", "shipment__tracking_code", "package__package_code")
