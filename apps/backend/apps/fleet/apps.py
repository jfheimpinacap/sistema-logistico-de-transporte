"""Django app configuration for fleet masters."""
from django.apps import AppConfig


class FleetConfig(AppConfig):
    """Configuration for the fleet app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.fleet"
