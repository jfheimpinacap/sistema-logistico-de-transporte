"""Django admin registrations for operational logistics."""
from django.contrib import admin

from apps.logistics.models import Package, Shipment, TrackingEvent


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    """Admin for shipments."""

    list_display = ("tracking_code", "customer", "recipient_name", "current_status", "priority", "is_active", "created_at")
    list_filter = ("current_status", "priority", "service_type", "is_active", "created_at")
    search_fields = ("tracking_code", "external_reference", "sender_name", "recipient_name", "recipient_phone")
    autocomplete_fields = ("customer", "origin_address", "destination_address", "origin_warehouse")


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    """Admin for packages."""

    list_display = ("package_code", "shipment", "status", "weight_kg", "is_fragile", "is_active", "created_at")
    list_filter = ("status", "is_fragile", "is_active", "created_at")
    search_fields = ("package_code", "barcode", "shipment__tracking_code", "description")
    autocomplete_fields = ("shipment",)


@admin.register(TrackingEvent)
class TrackingEventAdmin(admin.ModelAdmin):
    """Admin for tracking events."""

    list_display = ("shipment", "package", "status", "event_type", "title", "location_text", "occurred_at")
    list_filter = ("status", "event_type", "warehouse", "occurred_at")
    search_fields = ("shipment__tracking_code", "package__package_code", "title", "description", "location_text")
    autocomplete_fields = ("shipment", "package", "warehouse", "created_by")
