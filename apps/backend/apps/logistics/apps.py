"""Django app configuration for operational logistics."""
from django.apps import AppConfig


class LogisticsConfig(AppConfig):
    """Configure shipments, packages and tracking events."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.logistics"
    verbose_name = "operaciones logísticas"
