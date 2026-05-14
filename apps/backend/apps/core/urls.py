"""URL routes for core API endpoints."""
from django.urls import path

from apps.core.views import health_check

urlpatterns = [
    path("health/", health_check, name="health-check"),
]
