"""Models for delivery proofs and operational incidents in the field."""
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone

from apps.fleet.models import Driver, Vehicle
from apps.logistics.models import Package, Shipment, TrackingEvent
from apps.routing.models import Route, RouteShipment, RouteStop


class DeliveryProof(models.Model):
    """Proof captured in the field for deliveries, pickups, returns or failures."""

    class ProofType(models.TextChoices):
        """Supported evidence outcomes."""

        DELIVERY = "delivery", "Entrega"
        FAILED_DELIVERY = "failed_delivery", "Entrega fallida"
        PICKUP = "pickup", "Retiro"
        RETURN = "return", "Devolución"

    class Status(models.TextChoices):
        """Review status for captured proof."""

        PENDING_REVIEW = "pending_review", "Pendiente de revisión"
        ACCEPTED = "accepted", "Aceptada"
        REJECTED = "rejected", "Rechazada"

    shipment = models.ForeignKey(Shipment, on_delete=models.PROTECT, related_name="delivery_proofs", verbose_name="encomienda")
    package = models.ForeignKey(
        Package,
        on_delete=models.SET_NULL,
        related_name="delivery_proofs",
        verbose_name="bulto",
        blank=True,
        null=True,
    )
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, related_name="delivery_proofs", verbose_name="ruta", blank=True, null=True)
    route_stop = models.ForeignKey(
        RouteStop,
        on_delete=models.SET_NULL,
        related_name="delivery_proofs",
        verbose_name="parada de ruta",
        blank=True,
        null=True,
    )
    route_shipment = models.ForeignKey(
        RouteShipment,
        on_delete=models.SET_NULL,
        related_name="delivery_proofs",
        verbose_name="encomienda en ruta",
        blank=True,
        null=True,
    )
    proof_type = models.CharField("tipo de evidencia", max_length=30, choices=ProofType.choices, default=ProofType.DELIVERY)
    status = models.CharField("estado", max_length=30, choices=Status.choices, default=Status.PENDING_REVIEW)
    received_by_name = models.CharField("recibido por", max_length=160, blank=True)
    received_by_rut = models.CharField("RUT receptor", max_length=30, blank=True)
    recipient_relationship = models.CharField("relación con destinatario", max_length=80, blank=True)
    delivery_notes = models.TextField("observaciones de entrega", blank=True)
    photo = models.FileField("foto", upload_to="delivery_proofs/photos/", blank=True, null=True)
    signature_file = models.FileField("archivo de firma", upload_to="delivery_proofs/signatures/", blank=True, null=True)
    signature_text = models.CharField("firma textual", max_length=160, blank=True)
    latitude = models.DecimalField("latitud", max_digits=10, decimal_places=7, blank=True, null=True)
    longitude = models.DecimalField("longitud", max_digits=10, decimal_places=7, blank=True, null=True)
    location_accuracy_m = models.DecimalField("precisión ubicación m", max_digits=10, decimal_places=2, blank=True, null=True)
    location_text = models.CharField("ubicación", max_length=180, blank=True)
    captured_at = models.DateTimeField("capturada en", default=timezone.now)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="created_delivery_proofs",
        verbose_name="creada por",
        blank=True,
        null=True,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="reviewed_delivery_proofs",
        verbose_name="revisada por",
        blank=True,
        null=True,
    )
    reviewed_at = models.DateTimeField("revisada en", blank=True, null=True)
    review_notes = models.TextField("notas de revisión", blank=True)
    is_active = models.BooleanField("activa", default=True)
    created_at = models.DateTimeField("creada", auto_now_add=True)
    updated_at = models.DateTimeField("actualizada", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["-captured_at", "-created_at", "-id"]
        verbose_name = "evidencia de entrega"
        verbose_name_plural = "evidencias de entrega"

    def __str__(self) -> str:
        """Return a concise proof label."""
        return f"{self.shipment.tracking_code} - {self.get_proof_type_display()}"


class Incident(models.Model):
    """Operational incident reported from route or shipment execution."""

    class Category(models.TextChoices):
        """Incident categories supported by the MVP."""

        CUSTOMER_ABSENT = "customer_absent", "Cliente ausente"
        WRONG_ADDRESS = "wrong_address", "Dirección incorrecta"
        DAMAGED_PACKAGE = "damaged_package", "Paquete dañado"
        REJECTED_BY_RECIPIENT = "rejected_by_recipient", "Rechazado por destinatario"
        INACCESSIBLE_ZONE = "inaccessible_zone", "Zona inaccesible"
        VEHICLE_ISSUE = "vehicle_issue", "Problema de vehículo"
        PARTIAL_DELIVERY = "partial_delivery", "Entrega parcial"
        RESCHEDULED = "rescheduled", "Reprogramado"
        RETURNED_TO_WAREHOUSE = "returned_to_warehouse", "Devuelto a bodega"
        LOST_PACKAGE = "lost_package", "Paquete extraviado"
        OTHER = "other", "Otro"

    class Severity(models.TextChoices):
        """Incident severity levels."""

        LOW = "low", "Baja"
        MEDIUM = "medium", "Media"
        HIGH = "high", "Alta"
        CRITICAL = "critical", "Crítica"

    class Status(models.TextChoices):
        """Basic incident lifecycle."""

        OPEN = "open", "Abierta"
        IN_REVIEW = "in_review", "En revisión"
        RESOLVED = "resolved", "Resuelta"
        CANCELLED = "cancelled", "Cancelada"

    shipment = models.ForeignKey(Shipment, on_delete=models.SET_NULL, related_name="incidents", verbose_name="encomienda", blank=True, null=True)
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, related_name="incidents", verbose_name="bulto", blank=True, null=True)
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, related_name="incidents", verbose_name="ruta", blank=True, null=True)
    route_stop = models.ForeignKey(RouteStop, on_delete=models.SET_NULL, related_name="incidents", verbose_name="parada de ruta", blank=True, null=True)
    route_shipment = models.ForeignKey(
        RouteShipment,
        on_delete=models.SET_NULL,
        related_name="incidents",
        verbose_name="encomienda en ruta",
        blank=True,
        null=True,
    )
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, related_name="incidents", verbose_name="conductor", blank=True, null=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, related_name="incidents", verbose_name="vehículo", blank=True, null=True)
    incident_code = models.CharField("código de incidencia", max_length=40, unique=True, blank=True)
    category = models.CharField("categoría", max_length=40, choices=Category.choices, default=Category.OTHER)
    severity = models.CharField("severidad", max_length=20, choices=Severity.choices, default=Severity.MEDIUM)
    status = models.CharField("estado", max_length=20, choices=Status.choices, default=Status.OPEN)
    title = models.CharField("título", max_length=160)
    description = models.TextField("descripción")
    resolution_notes = models.TextField("notas de resolución", blank=True)
    location_text = models.CharField("ubicación", max_length=180, blank=True)
    latitude = models.DecimalField("latitud", max_digits=10, decimal_places=7, blank=True, null=True)
    longitude = models.DecimalField("longitud", max_digits=10, decimal_places=7, blank=True, null=True)
    evidence_file = models.FileField("archivo de evidencia", upload_to="incidents/evidence/", blank=True, null=True)
    occurred_at = models.DateTimeField("ocurrió en", default=timezone.now)
    resolved_at = models.DateTimeField("resuelta en", blank=True, null=True)
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="reported_incidents",
        verbose_name="reportada por",
        blank=True,
        null=True,
    )
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="resolved_incidents",
        verbose_name="resuelta por",
        blank=True,
        null=True,
    )
    is_active = models.BooleanField("activa", default=True)
    created_at = models.DateTimeField("creada", auto_now_add=True)
    updated_at = models.DateTimeField("actualizada", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["-occurred_at", "-created_at", "-id"]
        verbose_name = "incidencia operativa"
        verbose_name_plural = "incidencias operativas"

    def __str__(self) -> str:
        """Return a concise incident label."""
        return f"{self.incident_code} - {self.title}"

    @classmethod
    def generate_incident_code(cls) -> str:
        """Generate a daily incident code with a sequential suffix."""
        today = timezone.localdate()
        prefix = f"INC-{today:%Y%m%d}"
        with transaction.atomic():
            latest = (
                cls.objects.select_for_update()
                .filter(incident_code__startswith=prefix)
                .order_by("-incident_code")
                .first()
            )
            next_number = 1
            if latest:
                try:
                    next_number = int(latest.incident_code.rsplit("-", 1)[1]) + 1
                except (IndexError, ValueError):
                    next_number = cls.objects.filter(incident_code__startswith=prefix).count() + 1
            return f"{prefix}-{next_number:06d}"

    def save(self, *args, **kwargs):
        """Autogenerate incident code when absent."""
        if not self.incident_code:
            self.incident_code = self.generate_incident_code()
        super().save(*args, **kwargs)
