"""Create or update the local demo user used by development environments."""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """Seed the idempotent demo user."""

    help = "Create or update the demo user for local development."

    def handle(self, *args, **options):
        """Create the demo user if missing, otherwise update safe profile fields."""
        user_model = get_user_model()
        defaults = {
            "email": "demo@example.com",
            "first_name": "Usuario",
            "last_name": "Demo",
        }
        user, created = user_model.objects.get_or_create(
            username="demo",
            defaults=defaults,
        )

        changed_fields = []
        for field, value in defaults.items():
            if getattr(user, field) != value:
                setattr(user, field, value)
                changed_fields.append(field)

        password_changed = created or not user.check_password("demo1234")
        if password_changed:
            user.set_password("demo1234")
            changed_fields.append("password")

        if created:
            user.save()
            self.stdout.write(self.style.SUCCESS("Usuario demo creado: demo / demo1234"))
            return

        if changed_fields:
            user.save(update_fields=changed_fields)
            self.stdout.write(
                self.style.SUCCESS(
                    "Usuario demo existente actualizado: " + ", ".join(changed_fields)
                )
            )
            return

        self.stdout.write(self.style.SUCCESS("Usuario demo ya existe y está actualizado."))
