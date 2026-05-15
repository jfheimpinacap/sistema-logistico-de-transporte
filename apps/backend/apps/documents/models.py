"""Internal logistics document models.

These models represent operational/provisional logistics documents only. They do
not emit invoices, electronic dispatch guides or any real SII tax document.
"""
from decimal import Decimal

from django.conf import settings
from django.db import models, transaction
from django.db.models import Q
from django.utils import timezone

from apps.fieldops.models import DeliveryProof, Incident
from apps.fleet.models import Driver, Vehicle
from apps.locations.models import Warehouse
from apps.logistics.models import Package, Shipment
from apps.parties.models import Customer
from apps.routing.models import Route, RouteStop


class LogisticsDocument(models.Model):
    """Operational internal document for route, shipment and field workflows."""

    class DocumentType(models.TextChoices):
        """Supported internal document types."""

        TRANSFER_NOTE = "transfer_note", "Nota interna de traslado"
        ROUTE_MANIFEST = "route_manifest", "Manifiesto de carga"
        ROUTE_SHEET = "route_sheet", "Hoja de ruta"
        DELIVERY_RECEIPT = "delivery_receipt", "Comprobante interno de entrega"
        INCIDENT_REPORT = "incident_report", "Informe interno de incidencia"
        INTERNAL_NOTE = "internal_note", "Nota interna"

    class Status(models.TextChoices):
        """Document lifecycle states."""

        DRAFT = "draft", "Borrador"
        ISSUED = "issued", "Emitido"
        CANCELLED = "cancelled", "Anulado"
        ARCHIVED = "archived", "Archivado"

    NUMBER_PREFIXES = {
        DocumentType.TRANSFER_NOTE: "NTI",
        DocumentType.ROUTE_MANIFEST: "MAN",
        DocumentType.ROUTE_SHEET: "HRT",
        DocumentType.DELIVERY_RECEIPT: "CPE",
        DocumentType.INCIDENT_REPORT: "INR",
        DocumentType.INTERNAL_NOTE: "NIN",
    }

    document_number = models.CharField("folio interno", max_length=40, unique=True, blank=True)
    document_type = models.CharField("tipo", max_length=30, choices=DocumentType.choices)
    status = models.CharField("estado", max_length=20, choices=Status.choices, default=Status.DRAFT)

    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, related_name="logistics_documents", verbose_name="cliente", blank=True, null=True)
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, related_name="logistics_documents", verbose_name="ruta", blank=True, null=True)
    shipment = models.ForeignKey(Shipment, on_delete=models.SET_NULL, related_name="logistics_documents", verbose_name="encomienda", blank=True, null=True)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, related_name="logistics_documents", verbose_name="bodega", blank=True, null=True)
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, related_name="logistics_documents", verbose_name="conductor", blank=True, null=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, related_name="logistics_documents", verbose_name="vehículo", blank=True, null=True)
    delivery_proof = models.ForeignKey(DeliveryProof, on_delete=models.SET_NULL, related_name="logistics_documents", verbose_name="evidencia", blank=True, null=True)
    incident = models.ForeignKey(Incident, on_delete=models.SET_NULL, related_name="logistics_documents", verbose_name="incidencia", blank=True, null=True)

    title = models.CharField("título", max_length=180)
    description = models.TextField("descripción", blank=True)
    issue_date = models.DateField("fecha de emisión", default=timezone.localdate)
    issued_at = models.DateTimeField("emitido en", blank=True, null=True)
    cancelled_at = models.DateTimeField("anulado en", blank=True, null=True)
    archived_at = models.DateTimeField("archivado en", blank=True, null=True)
    origin_text = models.CharField("origen", max_length=240, blank=True)
    destination_text = models.CharField("destino", max_length=240, blank=True)
    customer_name_snapshot = models.CharField("cliente snapshot", max_length=180, blank=True)
    driver_name_snapshot = models.CharField("conductor snapshot", max_length=180, blank=True)
    vehicle_plate_snapshot = models.CharField("patente snapshot", max_length=30, blank=True)
    route_code_snapshot = models.CharField("código ruta snapshot", max_length=40, blank=True)
    shipment_tracking_code_snapshot = models.CharField("tracking snapshot", max_length=40, blank=True)

    notes = models.TextField("notas", blank=True)
    internal_observations = models.TextField("observaciones internas", blank=True)
    external_reference = models.CharField("referencia externa", max_length=100, blank=True)
    sii_reference = models.CharField(
        "referencia SII manual",
        max_length=100,
        blank=True,
        help_text="Referencia manual a documento externo/SII. No emite documentos tributarios reales.",
    )

    total_shipments = models.PositiveIntegerField("total encomiendas", default=0)
    total_packages = models.PositiveIntegerField("total bultos", default=0)
    total_weight_kg = models.DecimalField("peso total kg", max_digits=12, decimal_places=2, blank=True, null=True)
    total_volume_m3 = models.DecimalField("volumen total m3", max_digits=12, decimal_places=4, blank=True, null=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="created_logistics_documents", verbose_name="creado por", blank=True, null=True)
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="issued_logistics_documents", verbose_name="emitido por", blank=True, null=True)
    cancelled_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="cancelled_logistics_documents", verbose_name="anulado por", blank=True, null=True)

    attachment = models.FileField("adjunto", upload_to="documents/attachments/", blank=True, null=True)
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["-issue_date", "-created_at", "-id"]
        verbose_name = "documento logístico interno"
        verbose_name_plural = "documentos logísticos internos"

    def __str__(self) -> str:
        """Return the internal number and title."""
        return f"{self.document_number} - {self.title}"

    @classmethod
    def generate_document_number(cls, document_type: str) -> str:
        """Generate a daily internal folio for the requested document type."""
        today = timezone.localdate()
        prefix = cls.NUMBER_PREFIXES.get(document_type, "DOC")
        base = f"{prefix}-{today:%Y%m%d}"
        with transaction.atomic():
            latest = (
                cls.objects.select_for_update()
                .filter(document_number__startswith=base)
                .order_by("-document_number")
                .first()
            )
            next_number = 1
            if latest:
                try:
                    next_number = int(latest.document_number.rsplit("-", 1)[1]) + 1
                except (IndexError, ValueError):
                    next_number = cls.objects.filter(document_number__startswith=base).count() + 1
            return f"{base}-{next_number:06d}"

    def fill_snapshots(self):
        """Populate denormalized display snapshots from linked objects when empty."""
        if self.customer and not self.customer_name_snapshot:
            self.customer_name_snapshot = self.customer.name
        if self.driver and not self.driver_name_snapshot:
            self.driver_name_snapshot = str(self.driver)
        if self.vehicle and not self.vehicle_plate_snapshot:
            self.vehicle_plate_snapshot = self.vehicle.plate_number
        if self.route and not self.route_code_snapshot:
            self.route_code_snapshot = self.route.route_code
        if self.shipment and not self.shipment_tracking_code_snapshot:
            self.shipment_tracking_code_snapshot = self.shipment.tracking_code

    def recalculate_totals_from_lines(self):
        """Recalculate totals from active lines."""
        lines = self.lines.filter(is_active=True)
        shipment_ids = {line.shipment_id for line in lines if line.shipment_id}
        package_ids = {line.package_id for line in lines if line.package_id}
        weight = sum((line.weight_kg or Decimal("0")) for line in lines)
        volume = sum((line.volume_m3 or Decimal("0")) for line in lines)
        self.total_shipments = len(shipment_ids) or (1 if self.shipment_id else 0)
        self.total_packages = len(package_ids)
        self.total_weight_kg = weight or None
        self.total_volume_m3 = volume or None
        self.save(update_fields=["total_shipments", "total_packages", "total_weight_kg", "total_volume_m3", "updated_at"])
        return self

    def save(self, *args, **kwargs):
        """Autogenerate the internal document number and snapshots when needed."""
        if not self.document_number:
            self.document_number = self.generate_document_number(self.document_type)
        self.fill_snapshots()
        super().save(*args, **kwargs)


class LogisticsDocumentLine(models.Model):
    """Line/detail belonging to an internal logistics document."""

    document = models.ForeignKey(LogisticsDocument, on_delete=models.CASCADE, related_name="lines", verbose_name="documento")
    line_number = models.PositiveIntegerField("número de línea")
    shipment = models.ForeignKey(Shipment, on_delete=models.SET_NULL, related_name="document_lines", verbose_name="encomienda", blank=True, null=True)
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, related_name="document_lines", verbose_name="bulto", blank=True, null=True)
    route_stop = models.ForeignKey(RouteStop, on_delete=models.SET_NULL, related_name="document_lines", verbose_name="parada", blank=True, null=True)
    description = models.TextField("descripción")
    quantity = models.DecimalField("cantidad", max_digits=10, decimal_places=2, default=Decimal("1"))
    weight_kg = models.DecimalField("peso kg", max_digits=10, decimal_places=2, blank=True, null=True)
    volume_m3 = models.DecimalField("volumen m3", max_digits=10, decimal_places=4, blank=True, null=True)
    reference_code = models.CharField("referencia", max_length=100, blank=True)
    notes = models.TextField("notas", blank=True)
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["document", "line_number", "id"]
        verbose_name = "línea de documento logístico"
        verbose_name_plural = "líneas de documentos logísticos"
        constraints = [
            models.UniqueConstraint(
                fields=["document", "line_number"],
                condition=Q(is_active=True),
                name="unique_active_logistics_document_line_number",
            )
        ]

    def __str__(self) -> str:
        """Return document line label."""
        return f"{self.document.document_number} #{self.line_number}"
