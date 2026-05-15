"""Route planning models for routes, stops and shipment assignments."""
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.db.models import Q
from django.utils import timezone

from apps.fleet.models import Driver, Vehicle
from apps.locations.models import Address, Warehouse, Zone
from apps.logistics.models import Package, Shipment


class Route(models.Model):
    """Manual transport route with driver, vehicle and planned metrics."""

    class Status(models.TextChoices):
        """Available route workflow statuses."""

        DRAFT = "draft", "Borrador"
        PLANNED = "planned", "Planificada"
        ASSIGNED = "assigned", "Asignada"
        LOADED = "loaded", "Cargada"
        IN_PROGRESS = "in_progress", "En progreso"
        COMPLETED = "completed", "Completada"
        CANCELLED = "cancelled", "Cancelada"
        WITH_INCIDENTS = "with_incidents", "Con incidencias"

    route_code = models.CharField("código de ruta", max_length=40, unique=True, blank=True)
    name = models.CharField("nombre", max_length=160, blank=True)
    description = models.TextField("descripción", blank=True)
    route_date = models.DateField("fecha de ruta", default=timezone.localdate)
    planned_start_time = models.DateTimeField("inicio planificado", blank=True, null=True)
    planned_end_time = models.DateTimeField("fin planificado", blank=True, null=True)
    actual_start_time = models.DateTimeField("inicio real", blank=True, null=True)
    actual_end_time = models.DateTimeField("fin real", blank=True, null=True)
    origin_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name="routes",
        verbose_name="bodega origen",
        blank=True,
        null=True,
    )
    driver = models.ForeignKey(
        Driver,
        on_delete=models.SET_NULL,
        related_name="routes",
        verbose_name="conductor",
        blank=True,
        null=True,
    )
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.SET_NULL,
        related_name="routes",
        verbose_name="vehículo",
        blank=True,
        null=True,
    )
    status = models.CharField("estado", max_length=30, choices=Status.choices, default=Status.DRAFT)
    estimated_distance_km = models.DecimalField("distancia estimada km", max_digits=10, decimal_places=2, blank=True, null=True)
    estimated_duration_minutes = models.PositiveIntegerField("duración estimada minutos", blank=True, null=True)
    total_shipments = models.PositiveIntegerField("total encomiendas", default=0)
    total_packages = models.PositiveIntegerField("total bultos", default=0)
    total_weight_kg = models.DecimalField("peso total kg", max_digits=10, decimal_places=2, blank=True, null=True)
    total_volume_m3 = models.DecimalField("volumen total m3", max_digits=10, decimal_places=4, blank=True, null=True)
    notes = models.TextField("notas", blank=True)
    is_active = models.BooleanField("activa", default=True)
    created_at = models.DateTimeField("creada", auto_now_add=True)
    updated_at = models.DateTimeField("actualizada", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["-route_date", "route_code"]
        verbose_name = "ruta"
        verbose_name_plural = "rutas"

    def __str__(self) -> str:
        """Return the human-readable route code."""
        return self.route_code

    @classmethod
    def generate_route_code(cls) -> str:
        """Generate a readable daily route code without external dependencies."""
        today = timezone.localdate()
        prefix = f"RUT-{today:%Y%m%d}"
        with transaction.atomic():
            latest = (
                cls.objects.select_for_update()
                .filter(route_code__startswith=prefix)
                .order_by("-route_code")
                .first()
            )
            next_number = 1
            if latest:
                try:
                    next_number = int(latest.route_code.rsplit("-", 1)[1]) + 1
                except (IndexError, ValueError):
                    next_number = cls.objects.filter(route_code__startswith=prefix).count() + 1
            return f"{prefix}-{next_number:06d}"

    @property
    def name_or_code(self) -> str:
        """Return name when available; otherwise route code."""
        return self.name or self.route_code

    def recalculate_summary(self):
        """Recalculate shipment/package totals from active route assignments."""
        assignments = self.route_shipments.filter(is_active=True).select_related("shipment")
        shipments = [assignment.shipment for assignment in assignments]
        shipment_ids = [shipment.id for shipment in shipments]
        package_totals = Package.objects.filter(shipment_id__in=shipment_ids, is_active=True).aggregate(
            total_packages=models.Count("id"),
            total_weight_kg=models.Sum("weight_kg"),
            total_volume_m3=models.Sum("volume_m3"),
        )
        shipment_weight = sum((shipment.total_weight_kg or Decimal("0")) for shipment in shipments)
        shipment_volume = sum((shipment.total_volume_m3 or Decimal("0")) for shipment in shipments)
        package_weight = package_totals["total_weight_kg"] or Decimal("0")
        package_volume = package_totals["total_volume_m3"] or Decimal("0")

        self.total_shipments = len(shipments)
        self.total_packages = package_totals["total_packages"] or 0
        self.total_weight_kg = package_weight or shipment_weight or None
        self.total_volume_m3 = package_volume or shipment_volume or None
        self.save(
            update_fields=[
                "total_shipments",
                "total_packages",
                "total_weight_kg",
                "total_volume_m3",
                "updated_at",
            ]
        )
        return self

    def save(self, *args, **kwargs):
        """Autogenerate route code when absent."""
        if not self.route_code:
            self.route_code = self.generate_route_code()
        super().save(*args, **kwargs)


class RouteStop(models.Model):
    """Ordered stop within a route."""

    class StopType(models.TextChoices):
        """Available stop types."""

        PICKUP = "pickup", "Retiro"
        DELIVERY = "delivery", "Entrega"
        TRANSFER = "transfer", "Transferencia"
        WAREHOUSE = "warehouse", "Bodega"
        RETURN = "return", "Retorno"

    class Status(models.TextChoices):
        """Available stop statuses."""

        PENDING = "pending", "Pendiente"
        ARRIVED = "arrived", "Arribada"
        COMPLETED = "completed", "Completada"
        FAILED = "failed", "Fallida"
        SKIPPED = "skipped", "Saltada"
        CANCELLED = "cancelled", "Cancelada"

    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="stops", verbose_name="ruta")
    sequence = models.PositiveIntegerField("secuencia")
    address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        related_name="route_stops",
        verbose_name="dirección",
        blank=True,
        null=True,
    )
    zone = models.ForeignKey(
        Zone,
        on_delete=models.SET_NULL,
        related_name="route_stops",
        verbose_name="zona",
        blank=True,
        null=True,
    )
    stop_type = models.CharField("tipo de parada", max_length=20, choices=StopType.choices, default=StopType.DELIVERY)
    status = models.CharField("estado", max_length=20, choices=Status.choices, default=Status.PENDING)
    planned_arrival_time = models.DateTimeField("llegada planificada", blank=True, null=True)
    actual_arrival_time = models.DateTimeField("llegada real", blank=True, null=True)
    completed_at = models.DateTimeField("completada en", blank=True, null=True)
    contact_name = models.CharField("nombre contacto", max_length=160, blank=True)
    contact_phone = models.CharField("teléfono contacto", max_length=40, blank=True)
    instructions = models.TextField("instrucciones", blank=True)
    notes = models.TextField("notas", blank=True)
    is_active = models.BooleanField("activa", default=True)
    created_at = models.DateTimeField("creada", auto_now_add=True)
    updated_at = models.DateTimeField("actualizada", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["route", "sequence", "id"]
        verbose_name = "parada de ruta"
        verbose_name_plural = "paradas de ruta"
        constraints = [
            models.UniqueConstraint(fields=["route", "sequence"], name="unique_route_stop_sequence")
        ]

    def __str__(self) -> str:
        """Return a concise route stop label."""
        return f"{self.route.route_code} #{self.sequence}"


class RouteShipment(models.Model):
    """Assignment of a shipment to a route and optionally to a stop."""

    class Status(models.TextChoices):
        """Available route shipment statuses."""

        ASSIGNED = "assigned", "Asignada"
        LOADED = "loaded", "Cargada"
        IN_TRANSIT = "in_transit", "En tránsito"
        DELIVERED = "delivered", "Entregada"
        FAILED_DELIVERY = "failed_delivery", "Entrega fallida"
        RETURNED = "returned", "Devuelta"
        CANCELLED = "cancelled", "Cancelada"

    FINAL_ROUTE_STATUSES = [Route.Status.COMPLETED, Route.Status.CANCELLED]

    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="route_shipments", verbose_name="ruta")
    stop = models.ForeignKey(
        RouteStop,
        on_delete=models.SET_NULL,
        related_name="route_shipments",
        verbose_name="parada",
        blank=True,
        null=True,
    )
    shipment = models.ForeignKey(
        Shipment,
        on_delete=models.PROTECT,
        related_name="route_assignments",
        verbose_name="encomienda",
    )
    assigned_at = models.DateTimeField("asignada en", default=timezone.now)
    loaded_at = models.DateTimeField("cargada en", blank=True, null=True)
    delivered_at = models.DateTimeField("entregada en", blank=True, null=True)
    status = models.CharField("estado", max_length=30, choices=Status.choices, default=Status.ASSIGNED)
    notes = models.TextField("notas", blank=True)
    is_active = models.BooleanField("activa", default=True)
    created_at = models.DateTimeField("creada", auto_now_add=True)
    updated_at = models.DateTimeField("actualizada", auto_now=True)

    class Meta:
        """Model metadata."""

        ordering = ["route", "stop__sequence", "assigned_at"]
        verbose_name = "encomienda en ruta"
        verbose_name_plural = "encomiendas en ruta"
        constraints = [
            models.UniqueConstraint(
                fields=["route", "shipment"],
                condition=Q(is_active=True),
                name="unique_active_route_shipment_per_route",
            )
        ]

    def __str__(self) -> str:
        """Return assignment label."""
        return f"{self.route.route_code} - {self.shipment.tracking_code}"

    def clean(self):
        """Keep active assignments out of concurrent non-final routes."""
        conflict = RouteShipment.objects.filter(
            shipment=self.shipment,
            is_active=True,
        ).exclude(pk=self.pk).exclude(route__status__in=self.FINAL_ROUTE_STATUSES)
        if conflict.exists() and self.route.status not in self.FINAL_ROUTE_STATUSES:
            raise ValidationError("La encomienda ya está asignada activamente a una ruta no finalizada.")
        if self.stop and self.stop.route_id != self.route_id:
            raise ValidationError("La parada debe pertenecer a la misma ruta de la asignación.")
