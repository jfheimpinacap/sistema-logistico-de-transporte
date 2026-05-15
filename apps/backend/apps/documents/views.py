"""API viewsets for internal logistics documents."""
from decimal import Decimal

from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.documents.models import LogisticsDocument, LogisticsDocumentLine
from apps.documents.serializers import LogisticsDocumentLineSerializer, LogisticsDocumentSerializer
from apps.logistics.models import Package, Shipment, TrackingEvent
from apps.routing.models import Route, RouteShipment

TRUE_VALUES = {"1", "true", "t", "yes", "y", "on"}
FALSE_VALUES = {"0", "false", "f", "no", "n", "off"}
ROUTE_DOCUMENT_TYPES = {
    LogisticsDocument.DocumentType.ROUTE_MANIFEST,
    LogisticsDocument.DocumentType.ROUTE_SHEET,
    LogisticsDocument.DocumentType.TRANSFER_NOTE,
}
SHIPMENT_DOCUMENT_TYPES = {
    LogisticsDocument.DocumentType.DELIVERY_RECEIPT,
    LogisticsDocument.DocumentType.TRANSFER_NOTE,
}


def apply_boolean_filter(queryset, field_name: str, value: str | None):
    """Apply a simple boolean query-param filter."""
    if value is None:
        return queryset
    normalized = value.strip().lower()
    if normalized in TRUE_VALUES:
        return queryset.filter(**{field_name: True})
    if normalized in FALSE_VALUES:
        return queryset.filter(**{field_name: False})
    return queryset


def address_display(address) -> str:
    """Return a compact address display text."""
    if not address:
        return ""
    parts = [address.street, address.number, address.apartment, address.commune, address.city, address.region]
    return ", ".join(str(part).strip() for part in parts if str(part or "").strip()) or address.label


def warehouse_display(warehouse) -> str:
    """Return a compact warehouse display text."""
    if not warehouse:
        return ""
    if warehouse.address:
        return f"{warehouse.name} - {address_display(warehouse.address)}"
    return warehouse.name


def shipment_origin_display(shipment: Shipment) -> str:
    """Return origin text for a shipment."""
    return warehouse_display(shipment.origin_warehouse) or address_display(shipment.origin_address)


def shipment_destination_display(shipment: Shipment) -> str:
    """Return destination text for a shipment."""
    return address_display(shipment.destination_address)


def append_notes(existing: str, new_notes: str) -> str:
    """Append action notes without discarding existing document notes."""
    if not new_notes:
        return existing
    if not existing:
        return new_notes
    return f"{existing}\n{new_notes}"


def create_document_tracking_event(document: LogisticsDocument, action_label: str, user):
    """Create a shipment tracking event for document lifecycle actions."""
    if not document.shipment_id:
        return None
    return TrackingEvent.objects.create(
        shipment=document.shipment,
        status=document.shipment.current_status,
        event_type=TrackingEvent.EventType.SYSTEM,
        title=f"Documento interno {action_label}: {document.document_number}",
        description=f"{document.get_document_type_display()} {action_label.lower()} en módulo de documentos internos.",
        location_text=document.destination_text or document.origin_text,
        warehouse=document.warehouse,
        created_by=user if getattr(user, "is_authenticated", False) else None,
        occurred_at=timezone.now(),
    )


class LogisticsDocumentViewSet(viewsets.ModelViewSet):
    """CRUD API and actions for internal logistics documents."""

    permission_classes = [IsAuthenticated]
    serializer_class = LogisticsDocumentSerializer

    def get_queryset(self):
        """Return documents with manual filters and search."""
        queryset = LogisticsDocument.objects.select_related(
            "customer",
            "route",
            "shipment",
            "warehouse",
            "driver",
            "vehicle",
            "delivery_proof",
            "incident",
            "created_by",
            "issued_by",
            "cancelled_by",
        )
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(document_number__icontains=search)
                | Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(external_reference__icontains=search)
                | Q(sii_reference__icontains=search)
                | Q(notes__icontains=search)
                | Q(route_code_snapshot__icontains=search)
                | Q(shipment_tracking_code_snapshot__icontains=search)
                | Q(customer_name_snapshot__icontains=search)
            )
        for param, field_name in (
            ("document_type", "document_type"),
            ("status", "status"),
            ("customer", "customer_id"),
            ("route", "route_id"),
            ("shipment", "shipment_id"),
            ("warehouse", "warehouse_id"),
            ("driver", "driver_id"),
            ("vehicle", "vehicle_id"),
            ("issue_date", "issue_date"),
        ):
            value = self.request.query_params.get(param)
            if value:
                queryset = queryset.filter(**{field_name: value})
        return apply_boolean_filter(queryset, "is_active", self.request.query_params.get("is_active"))

    def perform_create(self, serializer):
        """Set creator on manual document creation."""
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        """Soft-delete documents by marking them inactive."""
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    @action(detail=True, methods=["post"], url_path="issue")
    def issue(self, request, pk=None):
        """Issue an internal document."""
        document = self.get_object()
        if document.status in {LogisticsDocument.Status.CANCELLED, LogisticsDocument.Status.ARCHIVED}:
            return Response({"detail": "No se puede emitir un documento anulado o archivado."}, status=status.HTTP_400_BAD_REQUEST)
        document.status = LogisticsDocument.Status.ISSUED
        document.issued_at = timezone.now()
        document.issued_by = request.user
        document.notes = append_notes(document.notes, request.data.get("notes", "").strip())
        document.save(update_fields=["status", "issued_at", "issued_by", "notes", "updated_at"])
        create_document_tracking_event(document, "Emitido", request.user)
        return Response(self.get_serializer(document).data)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        """Cancel an internal document."""
        document = self.get_object()
        document.status = LogisticsDocument.Status.CANCELLED
        document.cancelled_at = timezone.now()
        document.cancelled_by = request.user
        document.notes = append_notes(document.notes, request.data.get("notes", "").strip())
        document.save(update_fields=["status", "cancelled_at", "cancelled_by", "notes", "updated_at"])
        create_document_tracking_event(document, "Anulado", request.user)
        return Response(self.get_serializer(document).data)

    @action(detail=True, methods=["post"], url_path="archive")
    def archive(self, request, pk=None):
        """Archive an internal document."""
        document = self.get_object()
        document.status = LogisticsDocument.Status.ARCHIVED
        document.archived_at = timezone.now()
        document.notes = append_notes(document.notes, request.data.get("notes", "").strip())
        document.save(update_fields=["status", "archived_at", "notes", "updated_at"])
        return Response(self.get_serializer(document).data)

    @action(detail=False, methods=["post"], url_path="generate-from-route")
    def generate_from_route(self, request):
        """Create a draft internal document from a route and its assigned shipments."""
        route_id = request.data.get("route_id")
        document_type = request.data.get("document_type") or LogisticsDocument.DocumentType.ROUTE_MANIFEST
        if document_type not in ROUTE_DOCUMENT_TYPES:
            return Response({"document_type": "Tipo no soportado para generación desde ruta."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            route = Route.objects.select_related("origin_warehouse__address", "driver", "vehicle").get(pk=route_id)
        except Route.DoesNotExist:
            return Response({"route_id": "La ruta indicada no existe."}, status=status.HTTP_400_BAD_REQUEST)

        external_reference = f"generated:route:{route.id}:{document_type}"
        existing = LogisticsDocument.objects.filter(
            route=route,
            document_type=document_type,
            external_reference=external_reference,
            status__in=[LogisticsDocument.Status.DRAFT, LogisticsDocument.Status.ISSUED],
            is_active=True,
        ).first()
        if existing:
            return Response(self.get_serializer(existing).data)

        with transaction.atomic():
            document = LogisticsDocument.objects.create(
                document_type=document_type,
                status=LogisticsDocument.Status.DRAFT,
                route=route,
                warehouse=route.origin_warehouse,
                driver=route.driver,
                vehicle=route.vehicle,
                title=f"{LogisticsDocument.DocumentType(document_type).label} {route.route_code}",
                description=f"Documento interno generado desde ruta {route.route_code}.",
                origin_text=warehouse_display(route.origin_warehouse),
                destination_text=self._route_destination_text(route),
                route_code_snapshot=route.route_code,
                driver_name_snapshot=str(route.driver) if route.driver else "",
                vehicle_plate_snapshot=route.vehicle.plate_number if route.vehicle else "",
                external_reference=external_reference,
                created_by=request.user,
                total_shipments=route.total_shipments,
                total_packages=route.total_packages,
                total_weight_kg=route.total_weight_kg,
                total_volume_m3=route.total_volume_m3,
            )
            self._create_route_lines(document, route)
            self._recalculate_route_document_totals(document, route)
        return Response(self.get_serializer(document).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="generate-from-shipment")
    def generate_from_shipment(self, request):
        """Create a draft internal document from a shipment and its packages."""
        shipment_id = request.data.get("shipment_id")
        document_type = request.data.get("document_type") or LogisticsDocument.DocumentType.DELIVERY_RECEIPT
        if document_type not in SHIPMENT_DOCUMENT_TYPES:
            return Response({"document_type": "Tipo no soportado para generación desde encomienda."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            shipment = Shipment.objects.select_related("customer", "origin_address", "destination_address", "origin_warehouse__address").get(pk=shipment_id)
        except Shipment.DoesNotExist:
            return Response({"shipment_id": "La encomienda indicada no existe."}, status=status.HTTP_400_BAD_REQUEST)

        external_reference = f"generated:shipment:{shipment.id}:{document_type}"
        existing = LogisticsDocument.objects.filter(
            shipment=shipment,
            document_type=document_type,
            external_reference=external_reference,
            status__in=[LogisticsDocument.Status.DRAFT, LogisticsDocument.Status.ISSUED],
            is_active=True,
        ).first()
        if existing:
            return Response(self.get_serializer(existing).data)

        with transaction.atomic():
            document = LogisticsDocument.objects.create(
                document_type=document_type,
                status=LogisticsDocument.Status.DRAFT,
                customer=shipment.customer,
                shipment=shipment,
                warehouse=shipment.origin_warehouse,
                title=f"{LogisticsDocument.DocumentType(document_type).label} {shipment.tracking_code}",
                description=f"Documento interno generado desde encomienda {shipment.tracking_code}.",
                origin_text=shipment_origin_display(shipment),
                destination_text=shipment_destination_display(shipment),
                customer_name_snapshot=shipment.customer.name if shipment.customer else "",
                shipment_tracking_code_snapshot=shipment.tracking_code,
                notes=f"Remitente: {shipment.sender_name}. Destinatario: {shipment.recipient_name}.",
                external_reference=external_reference,
                created_by=request.user,
            )
            self._create_shipment_lines(document, shipment)
            document.recalculate_totals_from_lines()
        return Response(self.get_serializer(document).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="print-data")
    def print_data(self, request, pk=None):
        """Return JSON data ready for a printable frontend view; no PDF is generated."""
        document = self.get_object()
        lines = document.lines.filter(is_active=True).select_related("shipment", "package", "route_stop")
        data = {
            "document": LogisticsDocumentSerializer(document, context=self.get_serializer_context()).data,
            "lines": LogisticsDocumentLineSerializer(lines, many=True, context=self.get_serializer_context()).data,
            "related": {
                "route": {
                    "id": document.route_id,
                    "code": document.route.route_code if document.route else document.route_code_snapshot,
                    "name": document.route.name if document.route else "",
                },
                "shipment": {
                    "id": document.shipment_id,
                    "tracking_code": document.shipment.tracking_code if document.shipment else document.shipment_tracking_code_snapshot,
                    "sender_name": document.shipment.sender_name if document.shipment else "",
                    "recipient_name": document.shipment.recipient_name if document.shipment else "",
                },
            },
            "title": document.title,
            "totals": {
                "total_shipments": document.total_shipments,
                "total_packages": document.total_packages,
                "total_weight_kg": document.total_weight_kg,
                "total_volume_m3": document.total_volume_m3,
            },
            "generated_at": timezone.now(),
            "disclaimer": "Documento interno/provisorio. No corresponde a emisión tributaria real del SII.",
        }
        return Response(data)

    def _route_destination_text(self, route: Route) -> str:
        """Use the last active stop address as route destination text when available."""
        stop = route.stops.filter(is_active=True).select_related("address").order_by("-sequence").first()
        return address_display(stop.address) if stop and stop.address else ""

    def _create_route_lines(self, document: LogisticsDocument, route: Route):
        """Create one active document line per active route shipment."""
        assignments = RouteShipment.objects.filter(route=route, is_active=True).select_related("shipment", "stop").order_by("stop__sequence", "assigned_at", "id")
        for line_number, assignment in enumerate(assignments, start=1):
            shipment = assignment.shipment
            package_totals = Package.objects.filter(shipment=shipment, is_active=True).aggregate(
                total_weight=Sum("weight_kg"),
                total_volume=Sum("volume_m3"),
            )
            LogisticsDocumentLine.objects.create(
                document=document,
                line_number=line_number,
                shipment=shipment,
                route_stop=assignment.stop,
                description=f"Encomienda {shipment.tracking_code} para {shipment.recipient_name}",
                quantity=shipment.package_count or Decimal("1"),
                weight_kg=package_totals["total_weight"] or shipment.total_weight_kg,
                volume_m3=package_totals["total_volume"] or shipment.total_volume_m3,
                reference_code=shipment.tracking_code,
            )

    def _recalculate_route_document_totals(self, document: LogisticsDocument, route: Route):
        """Calculate route document totals from assignments and active packages."""
        shipment_ids = list(RouteShipment.objects.filter(route=route, is_active=True).values_list("shipment_id", flat=True))
        package_totals = Package.objects.filter(shipment_id__in=shipment_ids, is_active=True).aggregate(
            total_weight=Sum("weight_kg"),
            total_volume=Sum("volume_m3"),
        )
        document.total_shipments = len(set(shipment_ids))
        document.total_packages = Package.objects.filter(shipment_id__in=shipment_ids, is_active=True).count()
        document.total_weight_kg = package_totals["total_weight"] or route.total_weight_kg
        document.total_volume_m3 = package_totals["total_volume"] or route.total_volume_m3
        document.save(update_fields=["total_shipments", "total_packages", "total_weight_kg", "total_volume_m3", "updated_at"])

    def _create_shipment_lines(self, document: LogisticsDocument, shipment: Shipment):
        """Create one active document line per active package, with fallback to shipment line."""
        packages = list(shipment.packages.filter(is_active=True).order_by("package_code", "id"))
        if not packages:
            LogisticsDocumentLine.objects.create(
                document=document,
                line_number=1,
                shipment=shipment,
                description=f"Encomienda {shipment.tracking_code}",
                quantity=shipment.package_count or Decimal("1"),
                weight_kg=shipment.total_weight_kg,
                volume_m3=shipment.total_volume_m3,
                reference_code=shipment.tracking_code,
            )
            return
        for line_number, package in enumerate(packages, start=1):
            LogisticsDocumentLine.objects.create(
                document=document,
                line_number=line_number,
                shipment=shipment,
                package=package,
                description=package.description or f"Bulto {package.package_code}",
                quantity=Decimal("1"),
                weight_kg=package.weight_kg,
                volume_m3=package.volume_m3,
                reference_code=package.package_code,
            )


class LogisticsDocumentLineViewSet(viewsets.ModelViewSet):
    """CRUD API for internal logistics document lines."""

    permission_classes = [IsAuthenticated]
    serializer_class = LogisticsDocumentLineSerializer

    def get_queryset(self):
        """Return document lines with manual filters and search."""
        queryset = LogisticsDocumentLine.objects.select_related("document", "shipment", "package", "route_stop")
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(Q(description__icontains=search) | Q(reference_code__icontains=search) | Q(notes__icontains=search))
        for param, field_name in (
            ("document", "document_id"),
            ("shipment", "shipment_id"),
            ("package", "package_id"),
            ("route_stop", "route_stop_id"),
        ):
            value = self.request.query_params.get(param)
            if value:
                queryset = queryset.filter(**{field_name: value})
        return apply_boolean_filter(queryset, "is_active", self.request.query_params.get("is_active"))

    def perform_destroy(self, instance):
        """Soft-delete document lines by marking them inactive."""
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
