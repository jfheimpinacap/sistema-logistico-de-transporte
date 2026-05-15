"""URL routes for route planning APIs."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.routing.views import RouteShipmentViewSet, RouteStopViewSet, RouteViewSet

router = DefaultRouter()
router.register("routes", RouteViewSet, basename="route")
router.register("route-stops", RouteStopViewSet, basename="route-stop")
router.register("route-shipments", RouteShipmentViewSet, basename="route-shipment")

urlpatterns = [path("", include(router.urls))]
