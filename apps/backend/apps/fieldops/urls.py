"""URL routes for field operations APIs."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.fieldops.views import DeliveryProofViewSet, IncidentViewSet

router = DefaultRouter()
router.register("delivery-proofs", DeliveryProofViewSet, basename="delivery-proof")
router.register("incidents", IncidentViewSet, basename="incident")

urlpatterns = [path("", include(router.urls))]
