"""Django admin registrations for route planning."""
from django.contrib import admin

from apps.routing.models import Route, RouteShipment, RouteStop


class RouteStopInline(admin.TabularInline):
    """Inline stops for route detail."""

    model = RouteStop
    extra = 0
    fields = ("sequence", "stop_type", "status", "address", "zone", "is_active")


class RouteShipmentInline(admin.TabularInline):
    """Inline shipment assignments for route detail."""

    model = RouteShipment
    extra = 0
    fields = ("shipment", "stop", "status", "assigned_at", "is_active")
    autocomplete_fields = ("shipment", "stop")


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    """Admin configuration for routes."""

    list_display = ("route_code", "name", "route_date", "status", "driver", "vehicle", "total_shipments", "is_active")
    list_filter = ("status", "route_date", "origin_warehouse", "is_active")
    search_fields = ("route_code", "name", "driver__first_name", "driver__last_name", "vehicle__plate_number")
    inlines = (RouteStopInline, RouteShipmentInline)


@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    """Admin configuration for route stops."""

    list_display = ("route", "sequence", "stop_type", "status", "address", "zone", "is_active")
    list_filter = ("status", "stop_type", "zone", "is_active")
    search_fields = ("route__route_code", "route__name", "address__label", "contact_name", "contact_phone")
    autocomplete_fields = ("route", "address", "zone")


@admin.register(RouteShipment)
class RouteShipmentAdmin(admin.ModelAdmin):
    """Admin configuration for route shipment assignments."""

    list_display = ("route", "shipment", "stop", "status", "assigned_at", "is_active")
    list_filter = ("status", "is_active", "route__route_date")
    search_fields = ("route__route_code", "route__name", "shipment__tracking_code", "shipment__recipient_name")
    autocomplete_fields = ("route", "stop", "shipment")
