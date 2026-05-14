"""Django admin registration for party masters."""
from django.contrib import admin

from apps.parties.models import Contact, Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    """Admin configuration for customers."""

    list_display = ("name", "tax_id", "email", "phone", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "tax_id", "email", "phone")


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    """Admin configuration for contacts."""

    list_display = ("name", "customer", "email", "phone", "role", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "customer__name", "email", "phone", "role")
