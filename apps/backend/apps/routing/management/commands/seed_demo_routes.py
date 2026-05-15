"""Seed demo routes, route stops and route shipment assignments."""
from decimal import Decimal

from django.core.management import BaseCommand, call_command
from django.utils import timezone

from apps.fleet.models import Driver, Vehicle
from apps.locations.models import Address, Warehouse, Zone
from apps.logistics.models import Shipment, TrackingEvent
from apps.routing.models import Route, RouteShipment, RouteStop


class Command(BaseCommand):
    """Create or update demo route planning data for local development."""

    help = "Create demo routes, stops and shipment assignments."

    def handle(self, *args, **options):
        """Seed demo data without duplicating existing records."""
        self._ensure_dependencies()

        warehouse = Warehouse.objects.filter(code="BOD-STGO").first() or Warehouse.objects.first()
        driver_1 = Driver.objects.filter(rut="11.111.111-1").first() or Driver.objects.first()
        driver_2 = Driver.objects.filter(rut="22.222.222-2").first() or Driver.objects.exclude(pk=getattr(driver_1, "pk", None)).first()
        vehicle_1 = Vehicle.objects.filter(plate_number="MOTO01").first() or Vehicle.objects.first()
        vehicle_2 = Vehicle.objects.filter(plate_number="CAMI01").first() or Vehicle.objects.exclude(pk=getattr(vehicle_1, "pk", None)).first()
        hub_address = warehouse.address if warehouse and warehouse.address else Address.objects.first()
        delivery_address = Address.objects.filter(label="Cliente Providencia Demo").first() or Address.objects.first()
        zone = delivery_address.zone if delivery_address and delivery_address.zone else Zone.objects.first()
        today = timezone.localdate()

        route_1, _ = Route.objects.update_or_create(
            route_code="RUT-DEMO-000001",
            defaults={
                "name": "Ruta demo reparto centro",
                "description": "Ruta planificada demo para reparto urbano.",
                "route_date": today,
                "origin_warehouse": warehouse,
                "driver": driver_1,
                "vehicle": vehicle_1,
                "status": Route.Status.ASSIGNED,
                "estimated_distance_km": Decimal("18.50"),
                "estimated_duration_minutes": 120,
                "notes": "Datos creados por seed_demo_routes.",
                "is_active": True,
            },
        )
        route_2, _ = Route.objects.update_or_create(
            route_code="RUT-DEMO-000002",
            defaults={
                "name": "Ruta demo borrador norte",
                "description": "Ruta en borrador para planificación manual posterior.",
                "route_date": today,
                "origin_warehouse": warehouse,
                "driver": driver_2,
                "vehicle": vehicle_2,
                "status": Route.Status.DRAFT,
                "estimated_distance_km": Decimal("32.00"),
                "estimated_duration_minutes": 210,
                "notes": "Pendiente de ordenar y confirmar.",
                "is_active": True,
            },
        )

        stop_1 = self._upsert_stop(
            route_1,
            1,
            hub_address,
            hub_address.zone if hub_address and hub_address.zone else zone,
            RouteStop.StopType.WAREHOUSE,
            "Despacho bodega",
            "+56 2 2345 6789",
            "Retirar carga asignada para ruta demo.",
        )
        stop_2 = self._upsert_stop(
            route_1,
            2,
            delivery_address,
            zone,
            RouteStop.StopType.DELIVERY,
            "Ana Pérez",
            "+56 9 3333 3333",
            "Entregar en recepción y solicitar nombre de receptor.",
        )
        stop_3 = self._upsert_stop(
            route_2,
            1,
            hub_address,
            hub_address.zone if hub_address and hub_address.zone else zone,
            RouteStop.StopType.PICKUP,
            "Operaciones bodega",
            "+56 2 2345 6789",
            "Parada preliminar en borrador.",
        )

        shipments = list(Shipment.objects.filter(tracking_code__in=["STL-DEMO-000001", "STL-DEMO-000002"]).order_by("tracking_code"))
        if not shipments:
            shipments = list(Shipment.objects.filter(is_active=True).order_by("id")[:2])
        for shipment in shipments:
            self._assign_shipment(route_1, stop_2, shipment)
        route_1.recalculate_summary()
        route_2.recalculate_summary()

        self.stdout.write(
            self.style.SUCCESS(
                f"Rutas demo creadas o actualizadas: {route_1.route_code}, {route_2.route_code}. "
                f"Paradas demo: {stop_1.id}, {stop_2.id}, {stop_3.id}."
            )
        )

    def _ensure_dependencies(self):
        """Ensure logistics and operations demo data exists using existing commands."""
        for command in ("seed_demo_logistics", "seed_demo_operations"):
            try:
                call_command(command, verbosity=0)
            except Exception as exc:  # pragma: no cover - friendly prepare fallback
                self.stdout.write(self.style.WARNING(f"No se pudo ejecutar {command}: {exc}"))

    def _upsert_stop(self, route, sequence, address, zone, stop_type, contact_name, contact_phone, instructions):
        """Create or update a demo stop by route and sequence."""
        stop, _ = RouteStop.objects.update_or_create(
            route=route,
            sequence=sequence,
            defaults={
                "address": address,
                "zone": zone,
                "stop_type": stop_type,
                "status": RouteStop.Status.PENDING,
                "contact_name": contact_name,
                "contact_phone": contact_phone,
                "instructions": instructions,
                "is_active": True,
            },
        )
        return stop

    def _assign_shipment(self, route, stop, shipment):
        """Assign a shipment to a demo route idempotently and create tracking event."""
        conflict = (
            RouteShipment.objects.filter(shipment=shipment, is_active=True)
            .exclude(route=route)
            .exclude(route__status__in=RouteShipment.FINAL_ROUTE_STATUSES)
            .first()
        )
        if conflict:
            return None
        assignment, _ = RouteShipment.objects.update_or_create(
            route=route,
            shipment=shipment,
            defaults={"stop": stop, "status": RouteShipment.Status.ASSIGNED, "is_active": True},
        )
        if shipment.current_status != Shipment.Status.ASSIGNED_TO_ROUTE:
            shipment.current_status = Shipment.Status.ASSIGNED_TO_ROUTE
            shipment.save(update_fields=["current_status", "updated_at"])
        TrackingEvent.objects.get_or_create(
            shipment=shipment,
            status=Shipment.Status.ASSIGNED_TO_ROUTE,
            event_type=TrackingEvent.EventType.SYSTEM,
            title="Asignada a ruta",
            defaults={
                "description": f"Encomienda asignada a la ruta demo {route.route_code}.",
                "location_text": route.origin_warehouse.name if route.origin_warehouse else route.route_code,
                "warehouse": route.origin_warehouse,
                "occurred_at": timezone.now(),
            },
        )
        return assignment
