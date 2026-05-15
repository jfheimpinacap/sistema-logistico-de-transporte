"""Create idempotent demo data for internal logistics documents."""
from decimal import Decimal

from django.core.management import BaseCommand, call_command
from django.db.models import Sum
from django.utils import timezone

from apps.documents.models import LogisticsDocument, LogisticsDocumentLine
from apps.logistics.models import Package, Shipment
from apps.routing.models import Route, RouteShipment


class Command(BaseCommand):
    """Seed demo internal/provisional logistics documents."""

    help = "Crea documentos internos logísticos demo de forma idempotente."

    def handle(self, *args, **options):
        """Run the documents seed."""
        self._ensure_dependencies()
        route = Route.objects.select_related("origin_warehouse__address", "driver", "vehicle").filter(is_active=True).order_by("route_code").first()
        shipment = Shipment.objects.select_related("customer", "origin_warehouse__address", "origin_address", "destination_address").filter(is_active=True).order_by("tracking_code").first()
        if not route or not shipment:
            self.stdout.write(self.style.WARNING("No hay ruta o encomienda disponible para seed_demo_documents."))
            return

        manifest = self._upsert_route_document("MAN-DEMO-000001", LogisticsDocument.DocumentType.ROUTE_MANIFEST, route)
        route_sheet = self._upsert_route_document("HRT-DEMO-000001", LogisticsDocument.DocumentType.ROUTE_SHEET, route)
        receipt = self._upsert_shipment_document("CPE-DEMO-000001", LogisticsDocument.DocumentType.DELIVERY_RECEIPT, shipment)
        transfer = self._upsert_route_document("NTI-DEMO-000001", LogisticsDocument.DocumentType.TRANSFER_NOTE, route)

        for document in (manifest, route_sheet, receipt, transfer):
            self._ensure_lines(document)

        self.stdout.write(
            self.style.SUCCESS(
                "Documentos internos demo creados o actualizados: manifiesto, hoja de ruta, comprobante de entrega y nota de traslado."
            )
        )

    def _ensure_dependencies(self):
        """Ensure previous demo seeds exist using friendly fallbacks."""
        for command in ("seed_demo_logistics", "seed_demo_operations", "seed_demo_routes", "seed_demo_fieldops"):
            try:
                call_command(command, verbosity=0)
            except Exception as exc:  # pragma: no cover - friendly prepare fallback
                self.stdout.write(self.style.WARNING(f"No se pudo ejecutar {command}: {exc}"))

    def _upsert_route_document(self, number, document_type, route):
        """Create or update a fixed-number demo route document."""
        destination_stop = route.stops.filter(is_active=True).select_related("address").order_by("-sequence").first()
        document, _ = LogisticsDocument.objects.update_or_create(
            document_number=number,
            defaults={
                "document_type": document_type,
                "status": LogisticsDocument.Status.DRAFT,
                "route": route,
                "warehouse": route.origin_warehouse,
                "driver": route.driver,
                "vehicle": route.vehicle,
                "title": f"{LogisticsDocument.DocumentType(document_type).label} demo {route.route_code}",
                "description": f"Documento interno demo generado desde ruta {route.route_code}.",
                "issue_date": timezone.localdate(),
                "origin_text": route.origin_warehouse.name if route.origin_warehouse else "",
                "destination_text": str(destination_stop.address) if destination_stop and destination_stop.address else "",
                "route_code_snapshot": route.route_code,
                "driver_name_snapshot": str(route.driver) if route.driver else "",
                "vehicle_plate_snapshot": route.vehicle.plate_number if route.vehicle else "",
                "external_reference": f"demo:route:{route.id}:{document_type}",
                "notes": "Documento interno/provisorio demo. No emite documentos tributarios reales del SII.",
                "is_active": True,
                "total_shipments": route.total_shipments,
                "total_packages": route.total_packages,
                "total_weight_kg": route.total_weight_kg,
                "total_volume_m3": route.total_volume_m3,
            },
        )
        return document

    def _upsert_shipment_document(self, number, document_type, shipment):
        """Create or update a fixed-number demo shipment document."""
        document, _ = LogisticsDocument.objects.update_or_create(
            document_number=number,
            defaults={
                "document_type": document_type,
                "status": LogisticsDocument.Status.DRAFT,
                "customer": shipment.customer,
                "shipment": shipment,
                "warehouse": shipment.origin_warehouse,
                "title": f"{LogisticsDocument.DocumentType(document_type).label} demo {shipment.tracking_code}",
                "description": f"Documento interno demo generado desde encomienda {shipment.tracking_code}.",
                "issue_date": timezone.localdate(),
                "origin_text": shipment.origin_warehouse.name if shipment.origin_warehouse else str(shipment.origin_address or ""),
                "destination_text": str(shipment.destination_address or ""),
                "customer_name_snapshot": shipment.customer.name if shipment.customer else "",
                "shipment_tracking_code_snapshot": shipment.tracking_code,
                "external_reference": f"demo:shipment:{shipment.id}:{document_type}",
                "notes": f"Remitente: {shipment.sender_name}. Destinatario: {shipment.recipient_name}. Documento interno/provisorio demo.",
                "is_active": True,
            },
        )
        return document

    def _ensure_lines(self, document):
        """Ensure demo document lines exist without duplicating active line numbers."""
        if document.lines.filter(is_active=True).exists():
            return
        if document.route_id:
            assignments = RouteShipment.objects.filter(route=document.route, is_active=True).select_related("shipment", "stop").order_by("stop__sequence", "id")
            for index, assignment in enumerate(assignments, start=1):
                shipment = assignment.shipment
                totals = Package.objects.filter(shipment=shipment, is_active=True).aggregate(weight=Sum("weight_kg"), volume=Sum("volume_m3"))
                LogisticsDocumentLine.objects.create(
                    document=document,
                    line_number=index,
                    shipment=shipment,
                    route_stop=assignment.stop,
                    description=f"Encomienda demo {shipment.tracking_code} para {shipment.recipient_name}",
                    quantity=shipment.package_count or Decimal("1"),
                    weight_kg=totals["weight"] or shipment.total_weight_kg,
                    volume_m3=totals["volume"] or shipment.total_volume_m3,
                    reference_code=shipment.tracking_code,
                )
            document.recalculate_totals_from_lines()
            return
        if document.shipment_id:
            packages = list(document.shipment.packages.filter(is_active=True).order_by("package_code", "id"))
            if not packages:
                LogisticsDocumentLine.objects.create(
                    document=document,
                    line_number=1,
                    shipment=document.shipment,
                    description=f"Encomienda demo {document.shipment.tracking_code}",
                    quantity=document.shipment.package_count or Decimal("1"),
                    weight_kg=document.shipment.total_weight_kg,
                    volume_m3=document.shipment.total_volume_m3,
                    reference_code=document.shipment.tracking_code,
                )
            for index, package in enumerate(packages, start=1):
                LogisticsDocumentLine.objects.create(
                    document=document,
                    line_number=index,
                    shipment=document.shipment,
                    package=package,
                    description=package.description or f"Bulto demo {package.package_code}",
                    quantity=Decimal("1"),
                    weight_kg=package.weight_kg,
                    volume_m3=package.volume_m3,
                    reference_code=package.package_code,
                )
            document.recalculate_totals_from_lines()
