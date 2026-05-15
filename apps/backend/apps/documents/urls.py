"""URL routes for internal logistics document APIs."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.documents.views import LogisticsDocumentLineViewSet, LogisticsDocumentViewSet

router = DefaultRouter()
router.register("documents", LogisticsDocumentViewSet, basename="document")
router.register("document-lines", LogisticsDocumentLineViewSet, basename="document-line")

urlpatterns = [path("", include(router.urls))]
