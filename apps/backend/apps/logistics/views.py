"""API viewsets for operational logistics."""
from django.db.models import Count, Prefetch, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.locations.models import Warehouse
from apps.logistics.models import Package, Shipment, TrackingEvent
from apps.logistics.serializers import (
    PackageSerializer,
    ShipmentChangeStatusSerializer,
    ShipmentSerializer,
    TrackingEventSerializer,
)


TRUE_VALUES = {"1", "true", "t", "yes", "y", "on"}
FALSE_VALUES = {"0", "false", "f", "no", "n", "off"}


def apply_boolean_filter(queryset, field_name: str, value: str | None):
    """Apply a simple boolean query-param filter when the value is recognized."""
    if value is None:
        return queryset
    normalized = value.strip().lower()
    if normalized in TRUE_VALUES:
        return queryset.filter(**{field_name: True})
    if normalized in FALSE_VALUES:
        return queryset.filter(**{field_name: False})
    return queryset


class ShipmentViewSet(viewsets.ModelViewSet):
    """CRUD API for shipments plus status-change tracking action."""

    permission_classes = [IsAuthenticated]
    serializer_class = ShipmentSerializer

    def get_queryset(self):
        """Return shipments with lightweight search and manual filters."""
        latest_events = TrackingEvent.objects.order_by("-occurred_at", "-created_at", "-id")
        queryset = (
            Shipment.objects.select_related("customer", "origin_address", "destination_address", "origin_warehouse")
            .annotate(package_count_real=Count("packages", filter=Q(packages__is_active=True)))
            .prefetch_related(Prefetch("tracking_events", queryset=latest_events, to_attr="prefetched_tracking_events"))
        )

        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(tracking_code__icontains=search)
                | Q(external_reference__icontains=search)
                | Q(sender_name__icontains=search)
                | Q(recipient_name__icontains=search)
                | Q(recipient_phone__icontains=search)
            )

        for param, field_name in (
            ("current_status", "current_status"),
            ("priority", "priority"),
            ("service_type", "service_type"),
            ("customer", "customer_id"),
        ):
            value = self.request.query_params.get(param)
            if value:
                queryset = queryset.filter(**{field_name: value})

        return apply_boolean_filter(queryset, "is_active", self.request.query_params.get("is_active"))

    def perform_destroy(self, instance):
        """Soft-delete shipments by marking them inactive."""
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    @action(detail=True, methods=["post"], url_path="change-status")
    def change_status(self, request, pk=None):
        """Update shipment status and append a tracking event."""
        shipment = self.get_object()
        serializer = ShipmentChangeStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        event_time = data.get("occurred_at") or timezone.now()

        warehouse = None
        warehouse_id = data.get("warehouse")
        if warehouse_id:
            try:
                warehouse = Warehouse.objects.get(pk=warehouse_id)
            except Warehouse.DoesNotExist:
                return Response({"warehouse": "La bodega indicada no existe."}, status=status.HTTP_400_BAD_REQUEST)

        shipment.current_status = data["status"]
        update_fields = ["current_status", "updated_at"]
        if data["status"] == Shipment.Status.DELIVERED and not shipment.delivered_at:
            shipment.delivered_at = event_time
            update_fields.append("delivered_at")
        if data["status"] == Shipment.Status.RECEIVED and not shipment.received_at:
            shipment.received_at = event_time
            update_fields.append("received_at")
        shipment.save(update_fields=update_fields)

        event = TrackingEvent.objects.create(
            shipment=shipment,
            status=data["status"],
            event_type=TrackingEvent.EventType.STATUS_CHANGE,
            title=data["title"],
            description=data.get("description", ""),
            location_text=data.get("location_text", ""),
            warehouse=warehouse,
            created_by=request.user if request.user.is_authenticated else None,
            occurred_at=event_time,
        )
        response_serializer = TrackingEventSerializer(event)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class PackageViewSet(viewsets.ModelViewSet):
    """CRUD API for shipment packages."""

    permission_classes = [IsAuthenticated]
    serializer_class = PackageSerializer

    def get_queryset(self):
        """Return packages with manual filters."""
        queryset = Package.objects.select_related("shipment")
        shipment = self.request.query_params.get("shipment")
        if shipment:
            queryset = queryset.filter(shipment_id=shipment)
        status_value = self.request.query_params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)
        return apply_boolean_filter(queryset, "is_active", self.request.query_params.get("is_active"))

    def perform_destroy(self, instance):
        """Soft-delete packages by marking them inactive."""
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])


class TrackingEventViewSet(viewsets.ModelViewSet):
    """CRUD API for tracking events.

    Events are ordered newest first by model metadata and should normally be
    appended rather than edited or deleted. DELETE remains JWT-protected for the MVP.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = TrackingEventSerializer

    def get_queryset(self):
        """Return tracking events with manual filters."""
        queryset = TrackingEvent.objects.select_related("shipment", "package", "warehouse", "created_by")
        for param, field_name in (("shipment", "shipment_id"), ("package", "package_id"), ("status", "status")):
            value = self.request.query_params.get(param)
            if value:
                queryset = queryset.filter(**{field_name: value})
        return queryset

    def perform_create(self, serializer):
        """Default the creator to the authenticated user when absent."""
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
