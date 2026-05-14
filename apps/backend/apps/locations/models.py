"""Location master data models for logistics operations."""
from django.db import models
from django.db.models import Q


class Zone(models.Model):
    """Operational zone used to group addresses."""

    name = models.CharField("nombre", max_length=120)
    code = models.CharField("código", max_length=30, blank=True, null=True)
    description = models.TextField("descripción", blank=True)
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["name"]
        verbose_name = "zona"
        verbose_name_plural = "zonas"
        constraints = [
            models.UniqueConstraint(
                fields=["code"],
                condition=Q(code__isnull=False) & ~Q(code=""),
                name="unique_zone_code_when_present",
            )
        ]

    def __str__(self) -> str:
        """Return the zone name."""
        return self.name


class Address(models.Model):
    """Postal or operational address."""

    label = models.CharField("nombre", max_length=160)
    street = models.CharField("calle", max_length=160)
    number = models.CharField("número", max_length=30, blank=True)
    apartment = models.CharField("departamento/oficina", max_length=60, blank=True)
    commune = models.CharField("comuna", max_length=100)
    city = models.CharField("ciudad", max_length=100)
    region = models.CharField("región", max_length=100)
    country = models.CharField("país", max_length=80, default="Chile")
    postal_code = models.CharField("código postal", max_length=20, blank=True)
    latitude = models.DecimalField("latitud", max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField("longitud", max_digits=9, decimal_places=6, blank=True, null=True)
    zone = models.ForeignKey(
        Zone,
        on_delete=models.SET_NULL,
        related_name="addresses",
        verbose_name="zona",
        blank=True,
        null=True,
    )
    notes = models.TextField("notas", blank=True)
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["label"]
        verbose_name = "dirección"
        verbose_name_plural = "direcciones"

    def __str__(self) -> str:
        """Return the address label."""
        return self.label


class Warehouse(models.Model):
    """Warehouse or distribution center."""

    name = models.CharField("nombre", max_length=140)
    code = models.CharField("código", max_length=30, blank=True, null=True)
    address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        related_name="warehouses",
        verbose_name="dirección",
        blank=True,
        null=True,
    )
    phone = models.CharField("teléfono", max_length=40, blank=True)
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["name"]
        verbose_name = "bodega"
        verbose_name_plural = "bodegas"
        constraints = [
            models.UniqueConstraint(
                fields=["code"],
                condition=Q(code__isnull=False) & ~Q(code=""),
                name="unique_warehouse_code_when_present",
            )
        ]

    def __str__(self) -> str:
        """Return the warehouse name."""
        return self.name
