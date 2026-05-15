"""URL configuration for the logistics transport system."""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.core.urls")),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/", include("apps.parties.urls")),
    path("api/", include("apps.locations.urls")),
    path("api/", include("apps.fleet.urls")),
    path("api/", include("apps.logistics.urls")),
]
