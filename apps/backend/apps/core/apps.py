"""Django app configuration for core."""
from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Core application with shared endpoints and utilities."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"
    verbose_name = "Core"
