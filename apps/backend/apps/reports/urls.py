"""URL routes for operational report endpoints."""
from django.urls import path

from apps.reports.views import (
    DocumentsSummaryView,
    DriverPerformanceView,
    IncidentsSummaryView,
    OverviewReportView,
    RoutesSummaryView,
    ShipmentsSummaryView,
    VehicleUsageView,
)

urlpatterns = [
    path("reports/overview/", OverviewReportView.as_view(), name="reports-overview"),
    path("reports/shipments-summary/", ShipmentsSummaryView.as_view(), name="reports-shipments-summary"),
    path("reports/routes-summary/", RoutesSummaryView.as_view(), name="reports-routes-summary"),
    path("reports/incidents-summary/", IncidentsSummaryView.as_view(), name="reports-incidents-summary"),
    path("reports/documents-summary/", DocumentsSummaryView.as_view(), name="reports-documents-summary"),
    path("reports/driver-performance/", DriverPerformanceView.as_view(), name="reports-driver-performance"),
    path("reports/vehicle-usage/", VehicleUsageView.as_view(), name="reports-vehicle-usage"),
]
