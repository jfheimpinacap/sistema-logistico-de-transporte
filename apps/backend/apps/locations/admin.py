"""Django admin registration for location masters."""
from django.contrib import admin

from apps.locations.models import Address, Warehouse, Zone


@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    """Admin configuration for zones."""

    list_display = ("name", "code", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "code", "description")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """Admin configuration for addresses."""

    list_display = ("label", "commune", "city", "region", "zone", "is_active")
    list_filter = ("is_active", "region", "city", "zone")
    search_fields = ("label", "street", "commune", "city", "region", "zone__name")


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    """Admin configuration for warehouses."""

    list_display = ("name", "code", "address", "phone", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "code", "phone", "address__label")
