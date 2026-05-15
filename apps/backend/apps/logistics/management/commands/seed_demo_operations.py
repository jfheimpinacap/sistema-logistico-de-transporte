"""Seed demo operational shipments, packages and tracking events."""
from decimal import Decimal

from django.core.management import BaseCommand, call_command
from django.utils import timezone

from apps.locations.models import Address, Warehouse, Zone
from apps.logistics.models import Package, Shipment, TrackingEvent
from apps.parties.models import Customer


class Command(BaseCommand):
    """Create or update demo operations data for local development."""

    help = "Create demo shipments, packages and initial tracking events."

    def handle(self, *args, **options):
        """Seed demo data without duplicating existing records."""
        self._ensure_master_data()
        customer = Customer.objects.filter(tax_id="76.123.456-7").first() or Customer.objects.first()
        warehouse = Warehouse.objects.filter(code="BOD-STGO").first() or Warehouse.objects.first()
        origin_address = warehouse.address if warehouse and warehouse.address else Address.objects.first()
        destination = Address.objects.filter(label="Cliente Providencia Demo").first() or Address.objects.first()

        demos = [
            {
                "tracking_code": "STL-DEMO-000001",
                "external_reference": "OC-DEMO-1001",
                "sender_name": "Comercial Demo SpA",
                "sender_phone": "+56 2 2123 4567",
                "sender_email": "operaciones@comercialdemo.cl",
                "recipient_name": "Ana Pérez",
                "recipient_phone": "+56 9 3333 3333",
                "recipient_email": "ana.perez@example.com",
                "description": "Caja con documentos comerciales.",
                "package_count": 1,
                "total_weight_kg": Decimal("2.50"),
                "total_volume_m3": Decimal("0.0300"),
                "priority": Shipment.Priority.STANDARD,
                "service_type": Shipment.ServiceType.DELIVERY,
                "current_status": Shipment.Status.RECEIVED,
                "event_title": "Encomienda recibida",
                "packages": [
                    {"package_code": "STL-DEMO-000001-P01", "description": "Caja documentos", "weight_kg": Decimal("2.50")},
                ],
            },
            {
                "tracking_code": "STL-DEMO-000002",
                "external_reference": "OC-DEMO-1002",
                "sender_name": "Retail Demo Ltda.",
                "sender_phone": "+56 2 2987 6543",
                "sender_email": "logistica@retaildemo.cl",
                "recipient_name": "Carlos Soto",
                "recipient_phone": "+56 9 4444 4444",
                "recipient_email": "carlos.soto@example.com",
                "description": "Productos de ecommerce para clasificación.",
                "package_count": 2,
                "total_weight_kg": Decimal("8.75"),
                "total_volume_m3": Decimal("0.1200"),
                "priority": Shipment.Priority.EXPRESS,
                "service_type": Shipment.ServiceType.DELIVERY,
                "current_status": Shipment.Status.CLASSIFIED,
                "event_title": "Encomienda clasificada",
                "packages": [
                    {"package_code": "STL-DEMO-000002-P01", "description": "Caja ecommerce 1", "weight_kg": Decimal("4.25")},
                    {"package_code": "STL-DEMO-000002-P02", "description": "Caja ecommerce 2", "weight_kg": Decimal("4.50")},
                ],
            },
            {
                "tracking_code": "STL-DEMO-000003",
                "external_reference": "OC-DEMO-1003",
                "sender_name": "Comercial Demo SpA",
                "sender_phone": "+56 2 2123 4567",
                "sender_email": "operaciones@comercialdemo.cl",
                "recipient_name": "Bodega Cliente Norte",
                "recipient_phone": "+56 9 5555 5555",
                "recipient_email": "recepcion@example.com",
                "description": "Transferencia interna lista para ruta.",
                "package_count": 2,
                "total_weight_kg": Decimal("14.00"),
                "total_volume_m3": Decimal("0.2500"),
                "priority": Shipment.Priority.URGENT,
                "service_type": Shipment.ServiceType.TRANSFER,
                "current_status": Shipment.Status.READY_FOR_ROUTE,
                "event_title": "Lista para planificación de ruta",
                "packages": [
                    {"package_code": "STL-DEMO-000003-P01", "description": "Bulto transferencia 1", "weight_kg": Decimal("7.00")},
                    {"package_code": "STL-DEMO-000003-P02", "description": "Bulto transferencia 2", "weight_kg": Decimal("7.00")},
                ],
            },
        ]

        for demo in demos:
            packages = demo.pop("packages")
            event_title = demo.pop("event_title")
            shipment, _ = Shipment.objects.update_or_create(
                tracking_code=demo["tracking_code"],
                defaults={
                    **demo,
                    "customer": customer,
                    "origin_address": origin_address,
                    "destination_address": destination,
                    "origin_warehouse": warehouse,
                    "received_at": timezone.now() if demo["current_status"] == Shipment.Status.RECEIVED else None,
                    "is_active": True,
                },
            )
            for package_data in packages:
                Package.objects.update_or_create(
                    package_code=package_data["package_code"],
                    defaults={
                        "shipment": shipment,
                        "description": package_data["description"],
                        "weight_kg": package_data["weight_kg"],
                        "status": self._package_status_for(shipment.current_status),
                        "is_active": True,
                    },
                )
            TrackingEvent.objects.update_or_create(
                shipment=shipment,
                status=shipment.current_status,
                event_type=TrackingEvent.EventType.SYSTEM,
                title=event_title,
                defaults={
                    "description": "Evento inicial creado por seed demo operativo.",
                    "location_text": warehouse.name if warehouse else "Operación demo",
                    "warehouse": warehouse,
                    "occurred_at": shipment.received_at or timezone.now(),
                },
            )

        self.stdout.write(self.style.SUCCESS("Datos operativos demo creados o actualizados."))

    def _ensure_master_data(self):
        """Create required master data using existing command or local fallback."""
        try:
            call_command("seed_demo_logistics", verbosity=0)
            return
        except Exception as exc:  # pragma: no cover - friendly fallback for prepare
            self.stdout.write(self.style.WARNING(f"No se pudo ejecutar seed_demo_logistics: {exc}"))

        zone, _ = Zone.objects.update_or_create(
            code="RM-CENTRO",
            defaults={"name": "Santiago Centro", "description": "Zona demo.", "is_active": True},
        )
        address, _ = Address.objects.update_or_create(
            label="Hub Santiago Centro",
            defaults={
                "street": "Av. Libertador Bernardo O'Higgins",
                "number": "1449",
                "commune": "Santiago",
                "city": "Santiago",
                "region": "Región Metropolitana",
                "country": "Chile",
                "zone": zone,
                "is_active": True,
            },
        )
        Warehouse.objects.update_or_create(
            code="BOD-STGO",
            defaults={"name": "Bodega Santiago Demo", "address": address, "phone": "+56 2 2345 6789", "is_active": True},
        )
        Customer.objects.update_or_create(
            tax_id="76.123.456-7",
            defaults={"name": "Comercial Demo SpA", "email": "operaciones@comercialdemo.cl", "is_active": True},
        )

    def _package_status_for(self, shipment_status):
        """Map shipment statuses from demos to package statuses."""
        if shipment_status == Shipment.Status.READY_FOR_ROUTE:
            return Package.Status.CLASSIFIED
        if shipment_status == Shipment.Status.CLASSIFIED:
            return Package.Status.CLASSIFIED
        return Package.Status.RECEIVED
