"""URL routes for operational logistics APIs."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.logistics.views import PackageViewSet, ShipmentViewSet, TrackingEventViewSet

router = DefaultRouter()
router.register("shipments", ShipmentViewSet, basename="shipment")
router.register("packages", PackageViewSet, basename="package")
router.register("tracking-events", TrackingEventViewSet, basename="tracking-event")

urlpatterns = [path("", include(router.urls))]
