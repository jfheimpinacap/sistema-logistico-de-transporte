"""URL routes for location master APIs."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.locations.views import AddressViewSet, WarehouseViewSet, ZoneViewSet

router = DefaultRouter()
router.register("zones", ZoneViewSet, basename="zone")
router.register("addresses", AddressViewSet, basename="address")
router.register("warehouses", WarehouseViewSet, basename="warehouse")

urlpatterns = [path("", include(router.urls))]
