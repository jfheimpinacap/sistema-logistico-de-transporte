"""Django admin registration for fleet masters."""
from django.contrib import admin

from apps.fleet.models import Driver, Vehicle, VehicleType


@admin.register(VehicleType)
class VehicleTypeAdmin(admin.ModelAdmin):
    """Admin configuration for vehicle types."""

    list_display = ("name", "code", "max_weight_kg", "max_volume_m3", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "code", "description")


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    """Admin configuration for vehicles."""

    list_display = ("plate_number", "vehicle_type", "brand", "model", "status", "is_active")
    list_filter = ("is_active", "status", "vehicle_type")
    search_fields = ("plate_number", "brand", "model", "vehicle_type__name")


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    """Admin configuration for drivers."""

    list_display = ("first_name", "last_name", "rut", "user", "driver_type", "location_source", "status", "default_vehicle", "is_active")
    list_filter = ("is_active", "status", "driver_type", "location_source", "license_class")
    search_fields = ("first_name", "last_name", "rut", "email", "phone", "user__username", "user__email")
    autocomplete_fields = ("user", "default_vehicle")
