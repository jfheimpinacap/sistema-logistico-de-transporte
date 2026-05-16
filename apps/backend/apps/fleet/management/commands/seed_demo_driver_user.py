"""Create a demo driver user linked to a demo Driver profile."""
from django.contrib.auth import get_user_model
from django.core.management import BaseCommand, call_command
from django.utils import timezone

from apps.fleet.models import Driver
from apps.routing.models import Route


class Command(BaseCommand):
    """Seed the idempotent demo conductor user and linked Driver."""

    help = "Create or update the demo conductor user linked to a Driver."

    def handle(self, *args, **options):
        """Create a user, link it to a driver and assign a demo route safely."""
        self._ensure_routes()
        user = self._upsert_user()
        driver = self._upsert_driver(user)
        route = self._assign_demo_route(driver)

        route_message = f" Ruta asignada: {route.route_code}." if route else " No se encontró ruta demo para asignar."
        self.stdout.write(
            self.style.SUCCESS(
                "Usuario conductor demo listo: conductor / conductor1234. "
                f"Driver vinculado: {driver.id}.{route_message}"
            )
        )

    def _ensure_routes(self):
        """Ensure prerequisite demo route data exists when the command is run alone."""
        try:
            call_command("seed_demo_routes", verbosity=0)
        except Exception as exc:  # pragma: no cover - friendly local setup fallback
            self.stdout.write(self.style.WARNING(f"No se pudo ejecutar seed_demo_routes automáticamente: {exc}"))

    def _upsert_user(self):
        """Create or update the demo conductor user without touching unrelated users."""
        user_model = get_user_model()
        defaults = {
            "email": "conductor@example.com",
            "first_name": "Conductor",
            "last_name": "Demo",
        }
        user, created = user_model.objects.get_or_create(username="conductor", defaults=defaults)

        changed_fields = []
        for field, value in defaults.items():
            if getattr(user, field) != value:
                setattr(user, field, value)
                changed_fields.append(field)

        if created or not user.check_password("conductor1234"):
            user.set_password("conductor1234")
            changed_fields.append("password")

        if created:
            user.save()
        elif changed_fields:
            user.save(update_fields=changed_fields)
        return user

    def _upsert_driver(self, user):
        """Find a demo Driver or create one, then link it to the conductor user."""
        driver = Driver.objects.filter(user=user).first() or Driver.objects.filter(rut="33.333.333-3").first()
        defaults = {
            "user": user,
            "first_name": "Conductor",
            "last_name": "Demo",
            "rut": "33.333.333-3",
            "email": "conductor@example.com",
            "phone": "+56 9 5555 0000",
            "license_class": "B",
            "driver_type": Driver.DriverType.EXTERNAL,
            "location_source": Driver.LocationSource.MOBILE_WEB,
            "status": Driver.Status.AVAILABLE,
            "is_active": True,
        }
        if driver is None:
            driver = Driver.objects.create(**defaults)
            return driver

        for field, value in defaults.items():
            setattr(driver, field, value)
        driver.save(update_fields=[*defaults.keys(), "updated_at"])
        return driver

    def _assign_demo_route(self, driver):
        """Assign one active demo route to the demo driver without deleting existing data."""
        route = (
            Route.objects.filter(route_code="RUT-DEMO-000001").first()
            or Route.objects.filter(is_active=True).exclude(status__in=[Route.Status.COMPLETED, Route.Status.CANCELLED]).first()
        )
        if route is None:
            return None

        route.driver = driver
        if route.status == Route.Status.DRAFT:
            route.status = Route.Status.ASSIGNED
        route.route_date = route.route_date or timezone.localdate()
        route.save(update_fields=["driver", "status", "route_date", "updated_at"])
        return route
