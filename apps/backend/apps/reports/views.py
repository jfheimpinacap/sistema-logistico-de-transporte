"""Thin API views for operational reports."""
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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
