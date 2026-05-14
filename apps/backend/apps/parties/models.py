"""Customer and contact master data models."""
from django.db import models
from django.db.models import Q


class Customer(models.Model):
    """Commercial customer used by logistics operations."""

    name = models.CharField("nombre o razón social", max_length=180)
    tax_id = models.CharField("RUT", max_length=30, blank=True, null=True)
    email = models.EmailField("email", blank=True)
    phone = models.CharField("teléfono", max_length=40, blank=True)
    address_text = models.TextField("dirección", blank=True)
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["name"]
        verbose_name = "cliente"
        verbose_name_plural = "clientes"
        constraints = [
            models.UniqueConstraint(
                fields=["tax_id"],
                condition=Q(tax_id__isnull=False) & ~Q(tax_id=""),
                name="unique_customer_tax_id_when_present",
            )
        ]

    def __str__(self) -> str:
        """Return the customer display name."""
        return self.name


class Contact(models.Model):
    """Basic customer contact person."""

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="contacts",
        verbose_name="cliente",
    )
    name = models.CharField("nombre", max_length=160)
    email = models.EmailField("email", blank=True)
    phone = models.CharField("teléfono", max_length=40, blank=True)
    role = models.CharField("cargo o rol", max_length=80, blank=True)
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["customer__name", "name"]
        verbose_name = "contacto"
        verbose_name_plural = "contactos"

    def __str__(self) -> str:
        """Return the contact display name."""
        return self.name
