"""URL configuration for the logistics transport system."""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path


def health_check(_request):
    """Return a minimal response to confirm the backend is running."""
    return JsonResponse({"status": "ok", "service": "sistema-logistico-de-transporte"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
]
