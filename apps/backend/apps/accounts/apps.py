"""Django app configuration for accounts."""
from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """Accounts application for authentication support."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"
    verbose_name = "Accounts"
