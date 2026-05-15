"""Documents app configuration."""
from django.apps import AppConfig


class DocumentsConfig(AppConfig):
    """Internal logistics documents application."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.documents"
    verbose_name = "documentos logísticos internos"
