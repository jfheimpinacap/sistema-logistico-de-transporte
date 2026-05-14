"""URL routes for fleet master APIs."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.fleet.views import DriverViewSet, VehicleTypeViewSet, VehicleViewSet

router = DefaultRouter()
router.register("vehicle-types", VehicleTypeViewSet, basename="vehicle-type")
router.register("vehicles", VehicleViewSet, basename="vehicle")
router.register("drivers", DriverViewSet, basename="driver")

urlpatterns = [path("", include(router.urls))]
