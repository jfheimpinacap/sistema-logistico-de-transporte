"""API viewsets for route planning."""
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.fleet.models import Driver, Vehicle
from apps.logistics.models import Shipment, TrackingEvent
from apps.routing.models import Route, RouteShipment, RouteStop
from apps.routing.serializers import (
    RouteAssignShipmentsSerializer,
    RouteChangeStatusSerializer,
    RouteReorderStopsSerializer,
    RouteSerializer,
    RouteShipmentSerializer,
    RouteStopChangeStatusSerializer,
    RouteStopSerializer,
)

TRUE_VALUES = {"1", "true", "t", "yes", "y", "on"}
FALSE_VALUES = {"0", "false", "f", "no", "n", "off"}


def apply_boolean_filter(queryset, field_name: str, value: str | None):
    """Apply a permissive boolean query-param filter."""
    if value is None:
        return queryset
    normalized = value.strip().lower()
    if normalized in TRUE_VALUES:
        return queryset.filter(**{field_name: True})
    if normalized in FALSE_VALUES:
        return queryset.filter(**{field_name: False})
    return queryset


class RouteViewSet(viewsets.ModelViewSet):
    """CRUD API for routes plus route workflow actions."""

    permission_classes = [IsAuthenticated]
    serializer_class = RouteSerializer

    def get_queryset(self):
        """Return routes with manual search and filters."""
        queryset = Route.objects.select_related("origin_warehouse", "driver", "vehicle").annotate(
            stops_count=Count("stops", filter=Q(stops__is_active=True)),
            route_shipments_count=Count("route_shipments", filter=Q(route_shipments__is_active=True)),
        )
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(route_code__icontains=search)
                | Q(name__icontains=search)
                | Q(driver__first_name__icontains=search)
                | Q(driver__last_name__icontains=search)
                | Q(vehicle__plate_number__icontains=search)
            )
        for param, field_name in (
            ("status", "status"),
            ("route_date", "route_date"),
            ("driver", "driver_id"),
            ("vehicle", "vehicle_id"),
            ("origin_warehouse", "origin_warehouse_id"),
        ):
            value = self.request.query_params.get(param)
            if value:
                queryset = queryset.filter(**{field_name: value})
        return apply_boolean_filter(queryset, "is_active", self.request.query_params.get("is_active"))

    def perform_destroy(self, instance):
        """Soft-delete routes by marking them inactive."""
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    @action(detail=True, methods=["post"], url_path="change-status")
    def change_status(self, request, pk=None):
        """Update route status and optionally reserve/release driver and vehicle."""
        route = self.get_object()
        serializer = RouteChangeStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        now = timezone.now()

        route.status = data["status"]
        if data.get("notes"):
            route.notes = data["notes"]
        update_fields = ["status", "notes", "updated_at"]
        if route.status == Route.Status.IN_PROGRESS and not route.actual_start_time:
            route.actual_start_time = now
            update_fields.append("actual_start_time")
        if route.status == Route.Status.COMPLETED and not route.actual_end_time:
            route.actual_end_time = now
            update_fields.append("actual_end_time")
        route.save(update_fields=update_fields)

        if route.status in {Route.Status.ASSIGNED, Route.Status.IN_PROGRESS}:
            self._set_resources_status(route, Driver.Status.ASSIGNED, Vehicle.Status.ASSIGNED)
        if route.status in {Route.Status.COMPLETED, Route.Status.CANCELLED}:
            self._set_resources_status(route, Driver.Status.AVAILABLE, Vehicle.Status.AVAILABLE)

        return Response(RouteSerializer(route, context=self.get_serializer_context()).data)

    @action(detail=True, methods=["post"], url_path="recalculate-summary")
    def recalculate_summary(self, request, pk=None):
        """Recalculate totals for active route shipment assignments."""
        route = self.get_object().recalculate_summary()
        return Response(RouteSerializer(route, context=self.get_serializer_context()).data)

    @action(detail=True, methods=["post"], url_path="assign-shipments")
    def assign_shipments(self, request, pk=None):
        """Assign one or more shipments to a route and optionally to a stop."""
        route = self.get_object()
        serializer = RouteAssignShipmentsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        stop = None
        if data.get("stop_id"):
            try:
                stop = RouteStop.objects.get(pk=data["stop_id"], route=route, is_active=True)
            except RouteStop.DoesNotExist:
                return Response({"stop_id": "La parada indicada no existe o no pertenece a la ruta."}, status=400)

        created = []
        reused = []
        skipped = []
        with transaction.atomic():
            shipments = Shipment.objects.select_for_update().filter(id__in=data["shipment_ids"])
            for shipment in shipments:
                conflict = (
                    RouteShipment.objects.select_related("route")
                    .filter(shipment=shipment, is_active=True)
                    .exclude(route=route)
                    .exclude(route__status__in=RouteShipment.FINAL_ROUTE_STATUSES)
                    .first()
                )
                if conflict:
                    skipped.append(
                        {
                            "shipment_id": shipment.id,
                            "reason": f"Ya asignada a ruta activa {conflict.route.route_code}.",
                        }
                    )
                    continue
                assignment, was_created = RouteShipment.objects.get_or_create(
                    route=route,
                    shipment=shipment,
                    is_active=True,
                    defaults={"stop": stop, "status": RouteShipment.Status.ASSIGNED},
                )
                if not was_created and stop and assignment.stop_id != stop.id:
                    assignment.stop = stop
                    assignment.save(update_fields=["stop", "updated_at"])
                if shipment.current_status != Shipment.Status.ASSIGNED_TO_ROUTE:
                    shipment.current_status = Shipment.Status.ASSIGNED_TO_ROUTE
                    shipment.save(update_fields=["current_status", "updated_at"])
                TrackingEvent.objects.get_or_create(
                    shipment=shipment,
                    status=Shipment.Status.ASSIGNED_TO_ROUTE,
                    event_type=TrackingEvent.EventType.SYSTEM,
                    title="Asignada a ruta",
                    defaults={
                        "description": f"Encomienda asignada a la ruta {route.route_code}.",
                        "location_text": route.origin_warehouse.name if route.origin_warehouse else route.route_code,
                        "warehouse": route.origin_warehouse,
                        "created_by": request.user if request.user.is_authenticated else None,
                        "occurred_at": timezone.now(),
                    },
                )
                (created if was_created else reused).append(assignment.id)
            route.recalculate_summary()

        return Response(
            {
                "route": RouteSerializer(route, context=self.get_serializer_context()).data,
                "created_assignment_ids": created,
                "reused_assignment_ids": reused,
                "skipped": skipped,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="reorder-stops")
    def reorder_stops(self, request, pk=None):
        """Update manual sequence values for existing stops in a route."""
        route = self.get_object()
        serializer = RouteReorderStopsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        stops_payload = serializer.validated_data["stops"]
        stop_ids = [item["id"] for item in stops_payload]
        stops_by_id = RouteStop.objects.filter(route=route, id__in=stop_ids).in_bulk()
        missing = [stop_id for stop_id in stop_ids if stop_id not in stops_by_id]
        if missing:
            return Response({"stops": f"Las paradas no pertenecen a la ruta o no existen: {missing}"}, status=400)
        desired_sequences = [item["sequence"] for item in stops_payload]
        conflict = RouteStop.objects.filter(route=route, sequence__in=desired_sequences).exclude(id__in=stop_ids).first()
        if conflict:
            return Response({"stops": "Una secuencia indicada ya está ocupada por otra parada de la ruta."}, status=400)

        with transaction.atomic():
            temp_base = (RouteStop.objects.filter(route=route).order_by("-sequence").values_list("sequence", flat=True).first() or 0) + 1000
            for offset, stop_id in enumerate(stop_ids):
                RouteStop.objects.filter(pk=stop_id).update(sequence=temp_base + offset)
            for item in stops_payload:
                RouteStop.objects.filter(pk=item["id"]).update(sequence=item["sequence"], updated_at=timezone.now())
        data = RouteStopSerializer(
            RouteStop.objects.filter(route=route, id__in=stop_ids).order_by("sequence"),
            many=True,
            context=self.get_serializer_context(),
        ).data
        return Response(data)

    def _set_resources_status(self, route, driver_status, vehicle_status):
        """Update assigned driver/vehicle statuses when present."""
        if route.driver_id and route.driver.status != Driver.Status.INACTIVE:
            route.driver.status = driver_status
            route.driver.save(update_fields=["status", "updated_at"])
        if route.vehicle_id and route.vehicle.status != Vehicle.Status.MAINTENANCE:
            route.vehicle.status = vehicle_status
            route.vehicle.save(update_fields=["status", "updated_at"])


class RouteStopViewSet(viewsets.ModelViewSet):
    """CRUD API for route stops plus status updates."""

    permission_classes = [IsAuthenticated]
    serializer_class = RouteStopSerializer

    def get_queryset(self):
        """Return route stops with manual filters."""
        queryset = RouteStop.objects.select_related("route", "address", "zone")
        for param, field_name in (
            ("route", "route_id"),
            ("status", "status"),
            ("stop_type", "stop_type"),
            ("zone", "zone_id"),
        ):
            value = self.request.query_params.get(param)
            if value:
                queryset = queryset.filter(**{field_name: value})
        return apply_boolean_filter(queryset, "is_active", self.request.query_params.get("is_active"))

    def perform_destroy(self, instance):
        """Soft-delete route stops by marking them inactive."""
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    @action(detail=True, methods=["post"], url_path="change-status")
    def change_status(self, request, pk=None):
        """Update route stop status timestamps without evidence handling."""
        route_stop = self.get_object()
        serializer = RouteStopChangeStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        now = timezone.now()

        route_stop.status = data["status"]
        if data.get("notes"):
            route_stop.notes = data["notes"]
        update_fields = ["status", "notes", "updated_at"]
        if route_stop.status == RouteStop.Status.ARRIVED and not route_stop.actual_arrival_time:
            route_stop.actual_arrival_time = now
            update_fields.append("actual_arrival_time")
        if route_stop.status == RouteStop.Status.COMPLETED and not route_stop.completed_at:
            route_stop.completed_at = now
            update_fields.append("completed_at")
        route_stop.save(update_fields=update_fields)
        return Response(RouteStopSerializer(route_stop, context=self.get_serializer_context()).data)


class RouteShipmentViewSet(viewsets.ModelViewSet):
    """CRUD API for route shipment assignments."""

    permission_classes = [IsAuthenticated]
    serializer_class = RouteShipmentSerializer

    def get_queryset(self):
        """Return route shipment assignments with manual filters."""
        queryset = RouteShipment.objects.select_related("route", "stop", "shipment")
        for param, field_name in (
            ("route", "route_id"),
            ("stop", "stop_id"),
            ("shipment", "shipment_id"),
            ("status", "status"),
        ):
            value = self.request.query_params.get(param)
            if value:
                queryset = queryset.filter(**{field_name: value})
        return apply_boolean_filter(queryset, "is_active", self.request.query_params.get("is_active"))

    def perform_destroy(self, instance):
        """Soft-delete route shipment assignments by marking them inactive."""
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
        instance.route.recalculate_summary()
