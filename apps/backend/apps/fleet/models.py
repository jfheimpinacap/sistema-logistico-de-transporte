"""Fleet master data models."""
from django.conf import settings
from django.db import models
from django.db.models import Q


class VehicleType(models.Model):
    """Vehicle type and its reference capacities."""

    name = models.CharField("nombre", max_length=100)
    code = models.CharField("código", max_length=30, blank=True, null=True)
    description = models.TextField("descripción", blank=True)
    max_weight_kg = models.DecimalField(
        "peso máximo kg", max_digits=10, decimal_places=2, blank=True, null=True
    )
    max_volume_m3 = models.DecimalField(
        "volumen máximo m3", max_digits=10, decimal_places=2, blank=True, null=True
    )
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["name"]
        verbose_name = "tipo de vehículo"
        verbose_name_plural = "tipos de vehículo"
        constraints = [
            models.UniqueConstraint(
                fields=["code"],
                condition=Q(code__isnull=False) & ~Q(code=""),
                name="unique_vehicle_type_code_when_present",
            )
        ]

    def __str__(self) -> str:
        """Return the vehicle type name."""
        return self.name


class Vehicle(models.Model):
    """Transport vehicle."""

    class Status(models.TextChoices):
        """Available vehicle statuses."""

        AVAILABLE = "available", "Disponible"
        ASSIGNED = "assigned", "Asignado"
        MAINTENANCE = "maintenance", "Mantención"
        INACTIVE = "inactive", "Inactivo"

    plate_number = models.CharField("patente", max_length=20, unique=True)
    vehicle_type = models.ForeignKey(
        VehicleType,
        on_delete=models.PROTECT,
        related_name="vehicles",
        verbose_name="tipo de vehículo",
    )
    brand = models.CharField("marca", max_length=80, blank=True)
    model = models.CharField("modelo", max_length=80, blank=True)
    year = models.PositiveSmallIntegerField("año", blank=True, null=True)
    capacity_kg = models.DecimalField("capacidad kg", max_digits=10, decimal_places=2, blank=True, null=True)
    capacity_m3 = models.DecimalField("capacidad m3", max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField("estado", max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["plate_number"]
        verbose_name = "vehículo"
        verbose_name_plural = "vehículos"

    def __str__(self) -> str:
        """Return the vehicle plate number."""
        return self.plate_number


class Driver(models.Model):
    """Driver assigned to transport operations."""

    class Status(models.TextChoices):
        """Available driver statuses."""

        AVAILABLE = "available", "Disponible"
        ASSIGNED = "assigned", "Asignado"
        INACTIVE = "inactive", "Inactivo"

    class DriverType(models.TextChoices):
        """Basic ownership/relationship type for drivers."""

        INTERNAL = "internal", "Interno"
        EXTERNAL = "external", "Externo"

    class LocationSource(models.TextChoices):
        """Expected source for punctual driver or vehicle location reports."""

        MOBILE_WEB = "mobile_web", "Web móvil"
        MOBILE_APP = "mobile_app", "App móvil"
        VEHICLE_GPS = "vehicle_gps", "GPS vehículo"
        MANUAL = "manual", "Manual"
        UNKNOWN = "unknown", "No definido"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="driver_profile",
        verbose_name="usuario asociado",
        blank=True,
        null=True,
    )
    first_name = models.CharField("nombres", max_length=100)
    last_name = models.CharField("apellidos", max_length=100)
    rut = models.CharField("RUT", max_length=30, blank=True, null=True)
    email = models.EmailField("email", blank=True)
    phone = models.CharField("teléfono", max_length=40, blank=True)
    license_class = models.CharField("clase de licencia", max_length=20, blank=True)
    default_vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.SET_NULL,
        related_name="default_drivers",
        verbose_name="vehículo por defecto",
        blank=True,
        null=True,
    )
    driver_type = models.CharField(
        "tipo de conductor",
        max_length=20,
        choices=DriverType.choices,
        default=DriverType.INTERNAL,
    )
    location_source = models.CharField(
        "fuente de ubicación",
        max_length=20,
        choices=LocationSource.choices,
        default=LocationSource.MOBILE_WEB,
    )
    status = models.CharField("estado", max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["last_name", "first_name"]
        verbose_name = "conductor"
        verbose_name_plural = "conductores"
        constraints = [
            models.UniqueConstraint(
                fields=["rut"],
                condition=Q(rut__isnull=False) & ~Q(rut=""),
                name="unique_driver_rut_when_present",
            )
        ]

    def __str__(self) -> str:
        """Return the driver full name."""
        return f"{self.first_name} {self.last_name}".strip()
