"""URL routes for party master APIs."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.parties.views import ContactViewSet, CustomerViewSet

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("contacts", ContactViewSet, basename="contact")

urlpatterns = [path("", include(router.urls))]
