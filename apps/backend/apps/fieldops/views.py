"""API viewsets for field operations."""
from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.fieldops.models import DeliveryProof, Incident
from apps.fieldops.serializers import (
    DeliveryProofSerializer,
    IncidentSerializer,
    ResolutionNotesSerializer,
    ReviewNotesSerializer,
)
from apps.logistics.models import Package, Shipment, TrackingEvent
from apps.routing.models import RouteShipment


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


def authenticated_user_or_none(request):
    """Return request.user only when it is authenticated."""
    return request.user if request.user and request.user.is_authenticated else None


class DeliveryProofViewSet(viewsets.ModelViewSet):
    """CRUD API for delivery proofs plus review actions."""

    permission_classes = [IsAuthenticated]
    serializer_class = DeliveryProofSerializer

    def get_queryset(self):
        """Return proofs with manual filters and search."""
        queryset = DeliveryProof.objects.select_related(
            "shipment",
            "package",
            "route",
            "route_stop",
            "route_shipment",
            "created_by",
            "reviewed_by",
        )

        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(received_by_name__icontains=search)
                | Q(received_by_rut__icontains=search)
                | Q(delivery_notes__icontains=search)
                | Q(location_text__icontains=search)
            )

        for param, field_name in (
            ("shipment", "shipment_id"),
            ("package", "package_id"),
            ("route", "route_id"),
            ("route_stop", "route_stop_id"),
            ("route_shipment", "route_shipment_id"),
            ("proof_type", "proof_type"),
            ("status", "status"),
        ):
            value = self.request.query_params.get(param)
            if value:
                queryset = queryset.filter(**{field_name: value})
        return apply_boolean_filter(queryset, "is_active", self.request.query_params.get("is_active"))

    def perform_create(self, serializer):
        """Attach the authenticated creator."""
        serializer.save(created_by=authenticated_user_or_none(self.request))

    def perform_destroy(self, instance):
        """Soft-delete proofs by marking them inactive."""
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    @action(detail=True, methods=["post"], url_path="accept")
    def accept(self, request, pk=None):
        """Accept proof and update related operational status when applicable."""
        proof = self.get_object()
        serializer = ReviewNotesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        now = timezone.now()
        review_notes = serializer.validated_data.get("review_notes", "")

        with transaction_atomic():
            proof.status = DeliveryProof.Status.ACCEPTED
            proof.reviewed_by = authenticated_user_or_none(request)
            proof.reviewed_at = now
            proof.review_notes = review_notes
            proof.save(update_fields=["status", "reviewed_by", "reviewed_at", "review_notes", "updated_at"])

            if proof.proof_type == DeliveryProof.ProofType.DELIVERY:
                self._confirm_delivery(proof, request, now)
            elif proof.proof_type == DeliveryProof.ProofType.FAILED_DELIVERY:
                self._confirm_failed_delivery(proof, request, now)

        return Response(self.get_serializer(proof).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        """Reject proof and append a tracking note when shipment exists."""
        proof = self.get_object()
        serializer = ReviewNotesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        now = timezone.now()
        review_notes = serializer.validated_data.get("review_notes", "")

        proof.status = DeliveryProof.Status.REJECTED
        proof.reviewed_by = authenticated_user_or_none(request)
        proof.reviewed_at = now
        proof.review_notes = review_notes
        proof.save(update_fields=["status", "reviewed_by", "reviewed_at", "review_notes", "updated_at"])

        self._create_tracking_event(
            proof.shipment,
            proof.package,
            proof.shipment.current_status,
            TrackingEvent.EventType.MANUAL_NOTE,
            "Evidencia rechazada",
            review_notes or "La evidencia fue rechazada durante la revisión.",
            proof.location_text,
            request,
            now,
        )
        return Response(self.get_serializer(proof).data, status=status.HTTP_200_OK)

    def _confirm_delivery(self, proof, request, event_time):
        """Mark linked shipment/assignment as delivered and create tracking."""
        shipment = proof.shipment
        update_fields = ["current_status", "updated_at"]
        shipment.current_status = Shipment.Status.DELIVERED
        if not shipment.delivered_at:
            shipment.delivered_at = event_time
            update_fields.append("delivered_at")
        shipment.save(update_fields=update_fields)

        if proof.package_id:
            Package.objects.filter(pk=proof.package_id).update(status=Package.Status.DELIVERED, updated_at=timezone.now())
        if proof.route_shipment_id:
            RouteShipment.objects.filter(pk=proof.route_shipment_id).update(
                status=RouteShipment.Status.DELIVERED,
                delivered_at=event_time,
                updated_at=timezone.now(),
            )
        self._create_tracking_event(
            shipment,
            proof.package,
            Shipment.Status.DELIVERED,
            TrackingEvent.EventType.STATUS_CHANGE,
            "Entrega confirmada",
            proof.delivery_notes or "Entrega confirmada mediante evidencia aceptada.",
            proof.location_text,
            request,
            event_time,
        )

    def _confirm_failed_delivery(self, proof, request, event_time):
        """Mark linked shipment/assignment as failed delivery and create tracking."""
        shipment = proof.shipment
        shipment.current_status = Shipment.Status.FAILED_DELIVERY
        shipment.save(update_fields=["current_status", "updated_at"])
        if proof.package_id:
            Package.objects.filter(pk=proof.package_id).update(status=Package.Status.FAILED_DELIVERY, updated_at=timezone.now())
        if proof.route_shipment_id:
            RouteShipment.objects.filter(pk=proof.route_shipment_id).update(
                status=RouteShipment.Status.FAILED_DELIVERY,
                updated_at=timezone.now(),
            )
        self._create_tracking_event(
            shipment,
            proof.package,
            Shipment.Status.FAILED_DELIVERY,
            TrackingEvent.EventType.EXCEPTION,
            "Entrega fallida confirmada",
            proof.delivery_notes or "Entrega fallida confirmada mediante evidencia aceptada.",
            proof.location_text,
            request,
            event_time,
        )

    def _create_tracking_event(self, shipment, package, status_value, event_type, title, description, location_text, request, occurred_at):
        """Append a shipment tracking event."""
        TrackingEvent.objects.create(
            shipment=shipment,
            package=package,
            status=status_value,
            event_type=event_type,
            title=title,
            description=description,
            location_text=location_text or "",
            created_by=authenticated_user_or_none(request),
            occurred_at=occurred_at,
        )


class IncidentViewSet(viewsets.ModelViewSet):
    """CRUD API for field incidents plus resolve/cancel actions."""

    permission_classes = [IsAuthenticated]
    serializer_class = IncidentSerializer

    def get_queryset(self):
        """Return incidents with manual filters and search."""
        queryset = Incident.objects.select_related(
            "shipment",
            "package",
            "route",
            "route_stop",
            "route_shipment",
            "driver",
            "vehicle",
            "reported_by",
            "resolved_by",
        )

        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(incident_code__icontains=search)
                | Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(resolution_notes__icontains=search)
            )

        for param, field_name in (
            ("shipment", "shipment_id"),
            ("package", "package_id"),
            ("route", "route_id"),
            ("route_stop", "route_stop_id"),
            ("route_shipment", "route_shipment_id"),
            ("driver", "driver_id"),
            ("vehicle", "vehicle_id"),
            ("category", "category"),
            ("severity", "severity"),
            ("status", "status"),
        ):
            value = self.request.query_params.get(param)
            if value:
                queryset = queryset.filter(**{field_name: value})
        return apply_boolean_filter(queryset, "is_active", self.request.query_params.get("is_active"))

    def perform_create(self, serializer):
        """Attach reporter and create exception tracking event when possible."""
        incident = serializer.save(reported_by=authenticated_user_or_none(self.request))
        self._create_incident_tracking_event(incident, "Incidencia reportada", incident.description, self.request)

    def perform_destroy(self, instance):
        """Soft-delete incidents by marking them inactive."""
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    @action(detail=True, methods=["post"], url_path="resolve")
    def resolve(self, request, pk=None):
        """Mark incident as resolved and append a shipment tracking event."""
        return self._close_incident(request, Incident.Status.RESOLVED, "Incidencia resuelta")

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        """Mark incident as cancelled and append a shipment tracking event."""
        return self._close_incident(request, Incident.Status.CANCELLED, "Incidencia cancelada")

    def _close_incident(self, request, target_status, event_title):
        """Resolve or cancel an incident with shared behavior."""
        incident = self.get_object()
        serializer = ResolutionNotesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notes = serializer.validated_data.get("resolution_notes", "")
        now = timezone.now()

        incident.status = target_status
        incident.resolved_by = authenticated_user_or_none(request)
        incident.resolved_at = now
        incident.resolution_notes = notes
        incident.save(update_fields=["status", "resolved_by", "resolved_at", "resolution_notes", "updated_at"])
        self._create_incident_tracking_event(incident, event_title, notes or event_title, request, now)
        return Response(self.get_serializer(incident).data, status=status.HTTP_200_OK)

    def _create_incident_tracking_event(self, incident, title, description, request, occurred_at=None):
        """Append an exception tracking event for incidents linked to a shipment."""
        if not incident.shipment_id:
            return None
        return TrackingEvent.objects.create(
            shipment=incident.shipment,
            package=incident.package,
            status=incident.shipment.current_status,
            event_type=TrackingEvent.EventType.EXCEPTION,
            title=title,
            description=f"{incident.incident_code}: {description}" if description else incident.incident_code,
            location_text=incident.location_text,
            created_by=authenticated_user_or_none(request),
            occurred_at=occurred_at or incident.occurred_at,
        )


# Small wrapper keeps imports explicit and avoids repeating transaction.atomic in methods.
def transaction_atomic():
    """Return Django's transaction.atomic context manager."""
    from django.db import transaction

    return transaction.atomic()
