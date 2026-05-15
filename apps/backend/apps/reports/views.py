"""Thin API views for operational reports."""
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.reports.exports.documents_export import export_documents_csv
from apps.reports.exports.drivers_export import export_driver_performance_csv
from apps.reports.exports.incidents_export import export_incidents_csv
from apps.reports.exports.routes_export import export_routes_csv
from apps.reports.exports.shipments_export import export_shipments_csv
from apps.reports.exports.vehicles_export import export_vehicle_usage_csv
from apps.reports.services.documents import get_documents_summary
from apps.reports.services.drivers import get_driver_performance
from apps.reports.services.incidents import get_incidents_summary
from apps.reports.services.overview import get_overview
from apps.reports.services.routes import get_routes_summary
from apps.reports.services.shipments import get_shipments_summary
from apps.reports.services.vehicles import get_vehicle_usage


class ReportAPIView(APIView):
    """Base class for authenticated read-only report endpoints."""

    permission_classes = [IsAuthenticated]


class OverviewReportView(ReportAPIView):
    """System-wide operational overview."""

    def get(self, request):
        return Response(get_overview())


class ShipmentsSummaryView(ReportAPIView):
    """Aggregated shipment and package metrics."""

    def get(self, request):
        return Response(get_shipments_summary(request.query_params))


class RoutesSummaryView(ReportAPIView):
    """Aggregated route, stop and assignment metrics."""

    def get(self, request):
        return Response(get_routes_summary(request.query_params))


class IncidentsSummaryView(ReportAPIView):
    """Aggregated incident metrics."""

    def get(self, request):
        return Response(get_incidents_summary(request.query_params))


class DocumentsSummaryView(ReportAPIView):
    """Aggregated internal document metrics."""

    def get(self, request):
        return Response(get_documents_summary(request.query_params))


class DriverPerformanceView(ReportAPIView):
    """Per-driver operational performance metrics."""

    def get(self, request):
        return Response(get_driver_performance(request.query_params))


class VehicleUsageView(ReportAPIView):
    """Per-vehicle usage metrics."""

    def get(self, request):
        return Response(get_vehicle_usage(request.query_params))


class ShipmentsExportView(ReportAPIView):
    """Export filtered shipments as Excel-compatible CSV."""

    def get(self, request):
        return export_shipments_csv(request.query_params)


class RoutesExportView(ReportAPIView):
    """Export filtered routes as Excel-compatible CSV."""

    def get(self, request):
        return export_routes_csv(request.query_params)


class IncidentsExportView(ReportAPIView):
    """Export filtered incidents as Excel-compatible CSV."""

    def get(self, request):
        return export_incidents_csv(request.query_params)


class DocumentsExportView(ReportAPIView):
    """Export filtered documents as Excel-compatible CSV."""

    def get(self, request):
        return export_documents_csv(request.query_params)


class DriverPerformanceExportView(ReportAPIView):
    """Export filtered driver performance as Excel-compatible CSV."""

    def get(self, request):
        return export_driver_performance_csv(request.query_params)


class VehicleUsageExportView(ReportAPIView):
    """Export filtered vehicle usage as Excel-compatible CSV."""

    def get(self, request):
        return export_vehicle_usage_csv(request.query_params)
