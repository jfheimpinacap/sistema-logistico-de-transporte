"""Django app configuration for field operations."""
from django.apps import AppConfig


class FieldopsConfig(AppConfig):
    """Configure the field operations Django app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.fieldops"
    verbose_name = "operaciones en terreno"
