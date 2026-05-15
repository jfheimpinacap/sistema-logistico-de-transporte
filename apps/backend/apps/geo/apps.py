"""Django app configuration for internal geographic utilities."""
from django.apps import AppConfig


class GeoConfig(AppConfig):
    """Configure the internal geo app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.geo"
    verbose_name = "georreferenciación interna"
