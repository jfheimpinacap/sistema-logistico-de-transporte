"""Django app configuration for customer and contact masters."""
from django.apps import AppConfig


class PartiesConfig(AppConfig):
    """Configuration for the parties app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.parties"
