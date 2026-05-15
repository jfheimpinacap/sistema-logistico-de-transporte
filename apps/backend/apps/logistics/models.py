"""Operational logistics models for shipments, packages and tracking."""
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone

from apps.locations.models import Address, Warehouse
from apps.parties.models import Customer


class Shipment(models.Model):
    """Main shipment/encomienda handled by the TMS."""

    class Priority(models.TextChoices):
        """Available shipment priorities."""

        STANDARD = "standard", "Estándar"
        EXPRESS = "express", "Express"
        URGENT = "urgent", "Urgente"

    class ServiceType(models.TextChoices):
        """Available service types for the operation."""

        PICKUP = "pickup", "Retiro"
        DELIVERY = "delivery", "Entrega"
        TRANSFER = "transfer", "Transferencia"

    class Status(models.TextChoices):
        """Operational shipment statuses."""

        DRAFT = "draft", "Borrador"
        RECEIVED = "received", "Recibida"
        CLASSIFIED = "classified", "Clasificada"
        READY_FOR_ROUTE = "ready_for_route", "Lista para ruta"
        ASSIGNED_TO_ROUTE = "assigned_to_route", "Asignada a ruta"
        IN_TRANSIT = "in_transit", "En tránsito"
        DELIVERED = "delivered", "Entregada"
        FAILED_DELIVERY = "failed_delivery", "Entrega fallida"
        RETURNED = "returned", "Devuelta"
        CANCELLED = "cancelled", "Cancelada"

    tracking_code = models.CharField("código de tracking", max_length=40, unique=True, blank=True)
    external_reference = models.CharField("referencia externa", max_length=80, blank=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="shipments",
        verbose_name="cliente",
        blank=True,
        null=True,
    )
    origin_address = models.ForeignKey(
        Address,
        on_delete=models.PROTECT,
        related_name="origin_shipments",
        verbose_name="dirección origen",
        blank=True,
        null=True,
    )
    destination_address = models.ForeignKey(
        Address,
        on_delete=models.PROTECT,
        related_name="destination_shipments",
        verbose_name="dirección destino",
        blank=True,
        null=True,
    )
    origin_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name="origin_shipments",
        verbose_name="bodega origen",
        blank=True,
        null=True,
    )
    sender_name = models.CharField("remitente", max_length=160)
    sender_phone = models.CharField("teléfono remitente", max_length=40, blank=True)
    sender_email = models.EmailField("email remitente", blank=True)
    recipient_name = models.CharField("destinatario", max_length=160)
    recipient_phone = models.CharField("teléfono destinatario", max_length=40, blank=True)
    recipient_email = models.EmailField("email destinatario", blank=True)
    description = models.TextField("descripción", blank=True)
    package_count = models.PositiveIntegerField("cantidad de bultos declarada", default=1)
    total_weight_kg = models.DecimalField("peso total kg", max_digits=10, decimal_places=2, blank=True, null=True)
    total_volume_m3 = models.DecimalField("volumen total m3", max_digits=10, decimal_places=4, blank=True, null=True)
    priority = models.CharField("prioridad", max_length=20, choices=Priority.choices, default=Priority.STANDARD)
    service_type = models.CharField("tipo de servicio", max_length=20, choices=ServiceType.choices, default=ServiceType.DELIVERY)
    current_status = models.CharField("estado actual", max_length=30, choices=Status.choices, default=Status.DRAFT)
    requested_delivery_date = models.DateField("fecha solicitada de entrega", blank=True, null=True)
    delivery_window_start = models.DateTimeField("inicio ventana de entrega", blank=True, null=True)
    delivery_window_end = models.DateTimeField("fin ventana de entrega", blank=True, null=True)
    received_at = models.DateTimeField("recibida en", blank=True, null=True)
    delivered_at = models.DateTimeField("entregada en", blank=True, null=True)
    notes = models.TextField("notas", blank=True)
    is_active = models.BooleanField("activa", default=True)
    created_at = models.DateTimeField("creada", auto_now_add=True)
    updated_at = models.DateTimeField("actualizada", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["-created_at", "-id"]
        verbose_name = "encomienda"
        verbose_name_plural = "encomiendas"

    def __str__(self) -> str:
        """Return the tracking code."""
        return self.tracking_code

    @classmethod
    def generate_tracking_code(cls) -> str:
        """Generate a readable daily tracking code without external dependencies."""
        today = timezone.localdate()
        prefix = f"STL-{today:%Y%m%d}"
        with transaction.atomic():
            latest = (
                cls.objects.select_for_update()
                .filter(tracking_code__startswith=prefix)
                .order_by("-tracking_code")
                .first()
            )
            next_number = 1
            if latest:
                try:
                    next_number = int(latest.tracking_code.rsplit("-", 1)[1]) + 1
                except (IndexError, ValueError):
                    next_number = cls.objects.filter(tracking_code__startswith=prefix).count() + 1
            return f"{prefix}-{next_number:06d}"

    def save(self, *args, **kwargs):
        """Autogenerate the tracking code when it was not provided."""
        if not self.tracking_code:
            self.tracking_code = self.generate_tracking_code()
        super().save(*args, **kwargs)


class Package(models.Model):
    """Individual package/bulto associated with a shipment."""

    class Status(models.TextChoices):
        """Operational package statuses."""

        RECEIVED = "received", "Recibido"
        CLASSIFIED = "classified", "Clasificado"
        LOADED = "loaded", "Cargado"
        IN_TRANSIT = "in_transit", "En tránsito"
        DELIVERED = "delivered", "Entregado"
        FAILED_DELIVERY = "failed_delivery", "Entrega fallida"
        RETURNED = "returned", "Devuelto"
        CANCELLED = "cancelled", "Cancelado"

    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name="packages", verbose_name="encomienda")
    package_code = models.CharField("código de bulto", max_length=60, unique=True, blank=True)
    description = models.TextField("descripción", blank=True)
    weight_kg = models.DecimalField("peso kg", max_digits=10, decimal_places=2, blank=True, null=True)
    length_cm = models.DecimalField("largo cm", max_digits=10, decimal_places=2, blank=True, null=True)
    width_cm = models.DecimalField("ancho cm", max_digits=10, decimal_places=2, blank=True, null=True)
    height_cm = models.DecimalField("alto cm", max_digits=10, decimal_places=2, blank=True, null=True)
    volume_m3 = models.DecimalField("volumen m3", max_digits=10, decimal_places=4, blank=True, null=True)
    declared_value = models.DecimalField("valor declarado", max_digits=12, decimal_places=2, blank=True, null=True)
    barcode = models.CharField("código de barras", max_length=80, blank=True)
    status = models.CharField("estado", max_length=30, choices=Status.choices, default=Status.RECEIVED)
    is_fragile = models.BooleanField("frágil", default=False)
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["shipment__tracking_code", "package_code"]
        verbose_name = "bulto"
        verbose_name_plural = "bultos"

    def __str__(self) -> str:
        """Return the package code."""
        return self.package_code

    def generate_package_code(self) -> str:
        """Generate a package code based on the parent shipment tracking code."""
        base_code = self.shipment.tracking_code or Shipment.generate_tracking_code()
        with transaction.atomic():
            siblings = Package.objects.select_for_update().filter(shipment=self.shipment).count()
            candidate_number = siblings + 1
            candidate = f"{base_code}-P{candidate_number:02d}"
            while Package.objects.filter(package_code=candidate).exists():
                candidate_number += 1
                candidate = f"{base_code}-P{candidate_number:02d}"
            return candidate

    def save(self, *args, **kwargs):
        """Autogenerate package code when it was not provided."""
        if not self.package_code:
            self.package_code = self.generate_package_code()
        super().save(*args, **kwargs)


class TrackingEvent(models.Model):
    """Immutable-style shipment/package tracking history entry.

    The default API ordering is newest first (`-occurred_at`) so clients can show
    the latest event quickly without rewriting historical rows.
    """

    class EventType(models.TextChoices):
        """Tracking event types."""

        STATUS_CHANGE = "status_change", "Cambio de estado"
        MANUAL_NOTE = "manual_note", "Nota manual"
        SYSTEM = "system", "Sistema"
        EXCEPTION = "exception", "Excepción"

    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name="tracking_events", verbose_name="encomienda")
    package = models.ForeignKey(
        Package,
        on_delete=models.CASCADE,
        related_name="tracking_events",
        verbose_name="bulto",
        blank=True,
        null=True,
    )
    status = models.CharField("estado", max_length=30, choices=Shipment.Status.choices)
    event_type = models.CharField(
        "tipo de evento", max_length=30, choices=EventType.choices, default=EventType.STATUS_CHANGE
    )
    title = models.CharField("título", max_length=160)
    description = models.TextField("descripción", blank=True)
    location_text = models.CharField("ubicación", max_length=180, blank=True)
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name="tracking_events",
        verbose_name="bodega",
        blank=True,
        null=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="tracking_events",
        verbose_name="creado por",
        blank=True,
        null=True,
    )
    occurred_at = models.DateTimeField("ocurrió en", default=timezone.now)
    created_at = models.DateTimeField("creado", auto_now_add=True)

    class Meta:
        """Model metadata."""

        ordering = ["-occurred_at", "-created_at", "-id"]
        verbose_name = "evento de tracking"
        verbose_name_plural = "eventos de tracking"

    def __str__(self) -> str:
        """Return a concise event label."""
        return f"{self.shipment.tracking_code} - {self.title}"
