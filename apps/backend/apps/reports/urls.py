"""URL routes for operational report endpoints."""
from django.urls import path

from apps.reports.views import (
    DocumentsExportView,
    DocumentsSummaryView,
    DriverPerformanceExportView,
    DriverPerformanceView,
    IncidentsExportView,
    IncidentsSummaryView,
    OverviewReportView,
    RoutesExportView,
    RoutesSummaryView,
    ShipmentsExportView,
    ShipmentsSummaryView,
    VehicleUsageExportView,
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
    path("reports/export/shipments.csv", ShipmentsExportView.as_view(), name="reports-export-shipments"),
    path("reports/export/routes.csv", RoutesExportView.as_view(), name="reports-export-routes"),
    path("reports/export/incidents.csv", IncidentsExportView.as_view(), name="reports-export-incidents"),
    path("reports/export/documents.csv", DocumentsExportView.as_view(), name="reports-export-documents"),
    path("reports/export/driver-performance.csv", DriverPerformanceExportView.as_view(), name="reports-export-driver-performance"),
    path("reports/export/vehicle-usage.csv", VehicleUsageExportView.as_view(), name="reports-export-vehicle-usage"),
]
