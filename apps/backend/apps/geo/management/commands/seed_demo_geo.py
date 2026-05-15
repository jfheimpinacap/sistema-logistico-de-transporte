"""Seed demo coordinates for existing Chilean demo addresses."""
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db.models import Q

from apps.locations.models import Address


DEMO_COORDINATES = [
    {
        "name": "Santiago Centro",
        "latitude": Decimal("-33.448890"),
        "longitude": Decimal("-70.669265"),
        "query": Q(label__icontains="Santiago Centro") | Q(commune__iexact="Santiago"),
    },
    {
        "name": "Providencia",
        "latitude": Decimal("-33.426280"),
        "longitude": Decimal("-70.617096"),
        "query": Q(label__icontains="Providencia") | Q(commune__iexact="Providencia"),
    },
    {
        "name": "Las Condes",
        "latitude": Decimal("-33.411650"),
        "longitude": Decimal("-70.575000"),
        "query": Q(label__icontains="Las Condes") | Q(commune__iexact="Las Condes"),
    },
    {
        "name": "Ñuñoa",
        "latitude": Decimal("-33.456940"),
        "longitude": Decimal("-70.597500"),
        "query": Q(label__icontains="Ñuñoa") | Q(label__icontains="Nunoa") | Q(commune__iexact="Ñuñoa") | Q(commune__iexact="Nunoa"),
    },
    {
        "name": "Estación Central",
        "latitude": Decimal("-33.462420"),
        "longitude": Decimal("-70.700620"),
        "query": Q(label__icontains="Estación Central") | Q(label__icontains="Estacion Central") | Q(commune__iexact="Estación Central") | Q(commune__iexact="Estacion Central"),
    },
]


class Command(BaseCommand):
    """Assign reasonable Santiago/Chile coordinates to existing demo addresses."""

    help = "Assign demo geo coordinates to existing addresses without duplicating them."

    def add_arguments(self, parser):
        """Register command options."""
        parser.add_argument(
            "--force",
            action="store_true",
            help="Overwrite existing latitude/longitude values on matching demo addresses.",
        )

    def handle(self, *args, **options):
        """Seed coordinates idempotently unless --force is used."""
        force = options.get("force", False)
        updated = 0
        skipped = 0
        matched_ids = set()

        for demo in DEMO_COORDINATES:
            addresses = Address.objects.filter(demo["query"], is_active=True).order_by("id")
            for address in addresses:
                matched_ids.add(address.id)
                has_coordinates = address.latitude is not None and address.longitude is not None
                if has_coordinates and not force:
                    skipped += 1
                    continue
                address.latitude = demo["latitude"]
                address.longitude = demo["longitude"]
                address.save(update_fields=["latitude", "longitude", "updated_at"])
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Coordenadas demo procesadas. Direcciones encontradas: {len(matched_ids)}. "
                f"Actualizadas: {updated}. Omitidas con coordenadas existentes: {skipped}."
            )
        )
