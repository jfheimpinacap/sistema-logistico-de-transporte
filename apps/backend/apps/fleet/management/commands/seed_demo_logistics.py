"""Seed idempotent demo logistics master data."""
from django.core.management.base import BaseCommand

from apps.fleet.models import Driver, Vehicle, VehicleType
from apps.locations.models import Address, Warehouse, Zone
from apps.parties.models import Customer


class Command(BaseCommand):
    """Create or update demo logistics master data for local development."""

    help = "Create demo zones, addresses, warehouse, fleet, drivers and customers."

    def handle(self, *args, **options):
        """Seed demo data without duplicating existing records."""
        zone_centro, _ = Zone.objects.update_or_create(
            code="RM-CENTRO",
            defaults={
                "name": "Santiago Centro",
                "description": "Zona urbana central de la Región Metropolitana.",
                "is_active": True,
            },
        )
        zone_norte, _ = Zone.objects.update_or_create(
            code="RM-NORTE",
            defaults={
                "name": "Santiago Norte",
                "description": "Zona norte para operaciones demo.",
                "is_active": True,
            },
        )

        address_hub, _ = Address.objects.update_or_create(
            label="Hub Santiago Centro",
            defaults={
                "street": "Av. Libertador Bernardo O'Higgins",
                "number": "1449",
                "commune": "Santiago",
                "city": "Santiago",
                "region": "Región Metropolitana",
                "country": "Chile",
                "postal_code": "8320000",
                "latitude": -33.448890,
                "longitude": -70.669265,
                "zone": zone_centro,
                "notes": "Dirección demo para bodega principal.",
                "is_active": True,
            },
        )
        address_cliente, _ = Address.objects.update_or_create(
            label="Cliente Providencia Demo",
            defaults={
                "street": "Av. Providencia",
                "number": "1208",
                "apartment": "Of. 501",
                "commune": "Providencia",
                "city": "Santiago",
                "region": "Región Metropolitana",
                "country": "Chile",
                "postal_code": "7500000",
                "latitude": -33.426280,
                "longitude": -70.617096,
                "zone": zone_norte,
                "notes": "Dirección demo de cliente.",
                "is_active": True,
            },
        )

        Warehouse.objects.update_or_create(
            code="BOD-STGO",
            defaults={
                "name": "Bodega Santiago Demo",
                "address": address_hub,
                "phone": "+56 2 2345 6789",
                "is_active": True,
            },
        )

        motorcycle, _ = VehicleType.objects.update_or_create(
            code="MOTO",
            defaults={
                "name": "Moto",
                "description": "Vehículo liviano para entregas rápidas.",
                "max_weight_kg": 25,
                "max_volume_m3": 0.15,
                "is_active": True,
            },
        )
        pickup, _ = VehicleType.objects.update_or_create(
            code="CAMIONETA",
            defaults={
                "name": "Camioneta",
                "description": "Vehículo mediano para reparto urbano.",
                "max_weight_kg": 800,
                "max_volume_m3": 4.5,
                "is_active": True,
            },
        )

        moto_vehicle, _ = Vehicle.objects.update_or_create(
            plate_number="MOTO01",
            defaults={
                "vehicle_type": motorcycle,
                "brand": "Honda",
                "model": "CB125F",
                "year": 2023,
                "capacity_kg": 20,
                "capacity_m3": 0.12,
                "status": Vehicle.Status.AVAILABLE,
                "is_active": True,
            },
        )
        pickup_vehicle, _ = Vehicle.objects.update_or_create(
            plate_number="CAMI01",
            defaults={
                "vehicle_type": pickup,
                "brand": "Toyota",
                "model": "Hilux",
                "year": 2022,
                "capacity_kg": 750,
                "capacity_m3": 4,
                "status": Vehicle.Status.AVAILABLE,
                "is_active": True,
            },
        )

        Driver.objects.update_or_create(
            rut="11.111.111-1",
            defaults={
                "first_name": "Carla",
                "last_name": "Rojas",
                "email": "carla.rojas@example.com",
                "phone": "+56 9 1111 1111",
                "license_class": "C",
                "default_vehicle": moto_vehicle,
                "status": Driver.Status.AVAILABLE,
                "is_active": True,
            },
        )
        Driver.objects.update_or_create(
            rut="22.222.222-2",
            defaults={
                "first_name": "Miguel",
                "last_name": "Fuentes",
                "email": "miguel.fuentes@example.com",
                "phone": "+56 9 2222 2222",
                "license_class": "B",
                "default_vehicle": pickup_vehicle,
                "status": Driver.Status.AVAILABLE,
                "is_active": True,
            },
        )

        Customer.objects.update_or_create(
            tax_id="76.123.456-7",
            defaults={
                "name": "Comercial Demo SpA",
                "email": "operaciones@comercialdemo.cl",
                "phone": "+56 2 2123 4567",
                "address_text": str(address_cliente),
                "is_active": True,
            },
        )
        Customer.objects.update_or_create(
            tax_id="77.987.654-3",
            defaults={
                "name": "Retail Demo Ltda.",
                "email": "logistica@retaildemo.cl",
                "phone": "+56 2 2987 6543",
                "address_text": "Av. Apoquindo 3000, Las Condes, Santiago",
                "is_active": True,
            },
        )

        self.stdout.write(self.style.SUCCESS("Datos maestros logísticos demo creados o actualizados."))
