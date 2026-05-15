"""Django admin registrations for field operations."""
from django.contrib import admin

from apps.fieldops.models import DeliveryProof, Incident


@admin.register(DeliveryProof)
class DeliveryProofAdmin(admin.ModelAdmin):
    """Admin configuration for delivery proofs."""

    list_display = ("id", "shipment", "proof_type", "status", "received_by_name", "captured_at", "is_active")
    search_fields = ("shipment__tracking_code", "received_by_name", "received_by_rut", "delivery_notes", "location_text")
    list_filter = ("proof_type", "status", "is_active", "captured_at", "created_at")
    raw_id_fields = ("shipment", "package", "route", "route_stop", "route_shipment", "created_by", "reviewed_by")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    """Admin configuration for operational incidents."""

    list_display = ("incident_code", "title", "category", "severity", "status", "shipment", "occurred_at", "is_active")
    search_fields = ("incident_code", "title", "description", "resolution_notes", "shipment__tracking_code")
    list_filter = ("category", "severity", "status", "is_active", "occurred_at", "created_at")
    raw_id_fields = (
        "shipment",
        "package",
        "route",
        "route_stop",
        "route_shipment",
        "driver",
        "vehicle",
        "reported_by",
        "resolved_by",
    )
    readonly_fields = ("created_at", "updated_at")
