"""Routing app configuration."""
from django.apps import AppConfig


class RoutingConfig(AppConfig):
    """Django app config for route planning and shipment assignment."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.routing"
    verbose_name = "Rutas y paradas"
