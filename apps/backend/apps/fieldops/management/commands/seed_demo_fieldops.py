"""Seed demo delivery proofs and operational incidents."""
from django.core.management import BaseCommand, call_command
from django.utils import timezone

from apps.fieldops.models import DeliveryProof, Incident
from apps.logistics.models import Package, Shipment, TrackingEvent
from apps.routing.models import Route, RouteShipment, RouteStop


class Command(BaseCommand):
    """Create or update field operations demo data for local development."""

    help = "Create demo delivery proofs and incidents."

    def handle(self, *args, **options):
        """Seed demo data without duplicating existing records."""
        self._ensure_dependencies()
        shipments = list(Shipment.objects.filter(tracking_code__startswith="STL-DEMO-").order_by("tracking_code"))
        if not shipments:
            shipments = list(Shipment.objects.filter(is_active=True).order_by("id")[:3])
        if not shipments:
            self.stdout.write(self.style.WARNING("No hay encomiendas disponibles para seed_demo_fieldops."))
            return

        shipment_1 = shipments[0]
        shipment_2 = shipments[1] if len(shipments) > 1 else shipments[0]
        shipment_3 = shipments[2] if len(shipments) > 2 else shipment_2

        self._upsert_delivery_proof(
            shipment=shipment_1,
            proof_type=DeliveryProof.ProofType.DELIVERY,
            defaults={
                "received_by_name": "Ana Pérez",
                "received_by_rut": "12.345.678-9",
                "recipient_relationship": "titular",
                "delivery_notes": "Entrega demo pendiente de revisión con firma textual.",
                "signature_text": "Ana Pérez",
                "location_text": "Recepción Cliente Providencia Demo",
                "status": DeliveryProof.Status.PENDING_REVIEW,
                "is_active": True,
            },
        )
        self._upsert_delivery_proof(
            shipment=shipment_2,
            proof_type=DeliveryProof.ProofType.FAILED_DELIVERY,
            defaults={
                "received_by_name": "",
                "received_by_rut": "",
                "recipient_relationship": "",
                "delivery_notes": "Cliente ausente al momento de la visita demo.",
                "signature_text": "",
                "location_text": "Domicilio destinatario demo",
                "status": DeliveryProof.Status.PENDING_REVIEW,
                "is_active": True,
            },
        )

        incidents_payload = [
            {
                "incident_code": "INC-DEMO-000001",
                "shipment": shipment_1,
                "category": Incident.Category.CUSTOMER_ABSENT,
                "severity": Incident.Severity.MEDIUM,
                "title": "Cliente ausente",
                "description": "No se encontró receptor disponible durante una visita demo.",
                "location_text": "Providencia, Santiago",
            },
            {
                "incident_code": "INC-DEMO-000002",
                "shipment": shipment_2,
                "category": Incident.Category.WRONG_ADDRESS,
                "severity": Incident.Severity.HIGH,
                "title": "Dirección incorrecta",
                "description": "La numeración informada no coincide con la dirección de entrega demo.",
                "location_text": "Santiago, Región Metropolitana",
            },
            {
                "incident_code": "INC-DEMO-000003",
                "shipment": shipment_3,
                "category": Incident.Category.DAMAGED_PACKAGE,
                "severity": Incident.Severity.HIGH,
                "title": "Paquete dañado",
                "description": "Se detectó embalaje golpeado durante la operación demo.",
                "location_text": "Bodega Santiago Demo",
            },
        ]
        for payload in incidents_payload:
            incident = self._upsert_incident(payload)
            self._ensure_incident_tracking_event(incident)

        self.stdout.write(
            self.style.SUCCESS(
                "Fieldops demo creado o actualizado: 2 evidencias y 3 incidencias operativas."
            )
        )

    def _ensure_dependencies(self):
        """Ensure previous demo seeds exist using friendly fallbacks."""
        for command in ("seed_demo_logistics", "seed_demo_operations", "seed_demo_routes"):
            try:
                call_command(command, verbosity=0)
            except Exception as exc:  # pragma: no cover - friendly prepare fallback
                self.stdout.write(self.style.WARNING(f"No se pudo ejecutar {command}: {exc}"))

    def _upsert_delivery_proof(self, shipment, proof_type, defaults):
        """Create or update one demo delivery proof for a shipment and proof type."""
        package = Package.objects.filter(shipment=shipment, is_active=True).order_by("package_code").first()
        route_shipment = (
            RouteShipment.objects.select_related("route", "stop")
            .filter(shipment=shipment, is_active=True)
            .order_by("route__route_code")
            .first()
        )
        route = route_shipment.route if route_shipment else Route.objects.filter(is_active=True).order_by("route_code").first()
        route_stop = route_shipment.stop if route_shipment else RouteStop.objects.filter(route=route).order_by("sequence").first() if route else None
        proof, _ = DeliveryProof.objects.update_or_create(
            shipment=shipment,
            proof_type=proof_type,
            defaults={
                **defaults,
                "package": package,
                "route": route,
                "route_stop": route_stop,
                "route_shipment": route_shipment,
                "captured_at": timezone.now(),
            },
        )
        return proof

    def _upsert_incident(self, payload):
        """Create or update one demo incident by fixed code."""
        shipment = payload["shipment"]
        package = Package.objects.filter(shipment=shipment, is_active=True).order_by("package_code").first()
        route_shipment = (
            RouteShipment.objects.select_related("route", "stop", "route__driver", "route__vehicle")
            .filter(shipment=shipment, is_active=True)
            .order_by("route__route_code")
            .first()
        )
        route = route_shipment.route if route_shipment else Route.objects.filter(is_active=True).order_by("route_code").first()
        incident, _ = Incident.objects.update_or_create(
            incident_code=payload["incident_code"],
            defaults={
                "shipment": shipment,
                "package": package,
                "route": route,
                "route_stop": route_shipment.stop if route_shipment else None,
                "route_shipment": route_shipment,
                "driver": route.driver if route else None,
                "vehicle": route.vehicle if route else None,
                "category": payload["category"],
                "severity": payload["severity"],
                "status": Incident.Status.OPEN,
                "title": payload["title"],
                "description": payload["description"],
                "location_text": payload["location_text"],
                "occurred_at": timezone.now(),
                "is_active": True,
            },
        )
        return incident

    def _ensure_incident_tracking_event(self, incident):
        """Create a demo exception tracking event for the incident when absent."""
        if not incident.shipment_id:
            return None
        event, _ = TrackingEvent.objects.get_or_create(
            shipment=incident.shipment,
            event_type=TrackingEvent.EventType.EXCEPTION,
            title=f"Incidencia demo {incident.incident_code}",
            defaults={
                "package": incident.package,
                "status": incident.shipment.current_status,
                "description": incident.description,
                "location_text": incident.location_text,
                "occurred_at": incident.occurred_at,
            },
        )
        return event
