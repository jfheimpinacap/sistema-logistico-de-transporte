"""DRF serializers for route planning APIs."""
from rest_framework import serializers

from apps.logistics.models import Shipment
from apps.routing.models import Route, RouteShipment, RouteStop


class RouteSerializer(serializers.ModelSerializer):
    """Serialize routes for CRUD APIs."""

    origin_warehouse_name = serializers.CharField(source="origin_warehouse.name", read_only=True)
    driver_name = serializers.CharField(source="driver.__str__", read_only=True)
    vehicle_plate = serializers.CharField(source="vehicle.plate_number", read_only=True)
    route_name_or_code = serializers.CharField(source="name_or_code", read_only=True)
    stops_count = serializers.IntegerField(read_only=True)
    route_shipments_count = serializers.IntegerField(read_only=True)

    class Meta:
        """Serializer metadata."""

        model = Route
        fields = (
            "id",
            "route_code",
            "name",
            "description",
            "route_date",
            "planned_start_time",
            "planned_end_time",
            "actual_start_time",
            "actual_end_time",
            "origin_warehouse",
            "origin_warehouse_name",
            "driver",
            "driver_name",
            "vehicle",
            "vehicle_plate",
            "route_name_or_code",
            "status",
            "estimated_distance_km",
            "estimated_duration_minutes",
            "total_shipments",
            "total_packages",
            "total_weight_kg",
            "total_volume_m3",
            "stops_count",
            "route_shipments_count",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "origin_warehouse_name",
            "driver_name",
            "vehicle_plate",
            "route_name_or_code",
            "total_shipments",
            "total_packages",
            "total_weight_kg",
            "total_volume_m3",
            "stops_count",
            "route_shipments_count",
            "created_at",
            "updated_at",
        )


class RouteStopSerializer(serializers.ModelSerializer):
    """Serialize route stops for CRUD APIs."""

    route_name_or_code = serializers.CharField(source="route.name_or_code", read_only=True)
    address_label = serializers.CharField(source="address.label", read_only=True)
    zone_name = serializers.CharField(source="zone.name", read_only=True)

    class Meta:
        """Serializer metadata."""

        model = RouteStop
        fields = (
            "id",
            "route",
            "route_name_or_code",
            "sequence",
            "address",
            "address_label",
            "zone",
            "zone_name",
            "stop_type",
            "status",
            "planned_arrival_time",
            "actual_arrival_time",
            "completed_at",
            "contact_name",
            "contact_phone",
            "instructions",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "route_name_or_code", "address_label", "zone_name", "created_at", "updated_at")


class RouteShipmentSerializer(serializers.ModelSerializer):
    """Serialize shipment assignments for CRUD APIs."""

    route_name_or_code = serializers.CharField(source="route.name_or_code", read_only=True)
    shipment_tracking_code = serializers.CharField(source="shipment.tracking_code", read_only=True)
    shipment_recipient_name = serializers.CharField(source="shipment.recipient_name", read_only=True)
    stop_sequence = serializers.IntegerField(source="stop.sequence", read_only=True)

    class Meta:
        """Serializer metadata."""

        model = RouteShipment
        fields = (
            "id",
            "route",
            "route_name_or_code",
            "stop",
            "stop_sequence",
            "shipment",
            "shipment_tracking_code",
            "shipment_recipient_name",
            "assigned_at",
            "loaded_at",
            "delivered_at",
            "status",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "route_name_or_code",
            "shipment_tracking_code",
            "shipment_recipient_name",
            "stop_sequence",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        """Validate stop ownership and active route assignment conflicts."""
        route = attrs.get("route") or getattr(self.instance, "route", None)
        stop = attrs.get("stop") if "stop" in attrs else getattr(self.instance, "stop", None)
        shipment = attrs.get("shipment") or getattr(self.instance, "shipment", None)
        if route and stop and stop.route_id != route.id:
            raise serializers.ValidationError({"stop": "La parada debe pertenecer a la ruta indicada."})
        if shipment and route and route.status not in RouteShipment.FINAL_ROUTE_STATUSES:
            conflict = RouteShipment.objects.filter(shipment=shipment, is_active=True).exclude(
                route__status__in=RouteShipment.FINAL_ROUTE_STATUSES
            )
            if self.instance:
                conflict = conflict.exclude(pk=self.instance.pk)
            if conflict.exists():
                raise serializers.ValidationError(
                    {"shipment": "La encomienda ya está asignada activamente a una ruta no finalizada."}
                )
        return attrs


class RouteChangeStatusSerializer(serializers.Serializer):
    """Validate route change-status payload."""

    status = serializers.ChoiceField(choices=Route.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True)


class RouteAssignShipmentsSerializer(serializers.Serializer):
    """Validate route assign-shipments payload."""

    shipment_ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)
    stop_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_shipment_ids(self, value):
        """Validate unique shipment ids and existing shipments."""
        unique_ids = list(dict.fromkeys(value))
        existing_ids = set(Shipment.objects.filter(id__in=unique_ids).values_list("id", flat=True))
        missing_ids = [shipment_id for shipment_id in unique_ids if shipment_id not in existing_ids]
        if missing_ids:
            raise serializers.ValidationError(f"No existen encomiendas con ids: {missing_ids}")
        return unique_ids


class RouteReorderStopsSerializer(serializers.Serializer):
    """Validate route reorder-stops payload."""

    stops = serializers.ListField(child=serializers.DictField(), allow_empty=False)

    def validate_stops(self, value):
        """Validate stop ids and unique positive sequences."""
        normalized = []
        seen_ids = set()
        seen_sequences = set()
        for item in value:
            stop_id = item.get("id")
            sequence = item.get("sequence")
            if not isinstance(stop_id, int) or not isinstance(sequence, int):
                raise serializers.ValidationError("Cada parada debe incluir id y sequence enteros.")
            if sequence < 1:
                raise serializers.ValidationError("La secuencia debe ser un entero positivo.")
            if stop_id in seen_ids:
                raise serializers.ValidationError("No se permiten paradas duplicadas.")
            if sequence in seen_sequences:
                raise serializers.ValidationError("No se permiten secuencias duplicadas.")
            seen_ids.add(stop_id)
            seen_sequences.add(sequence)
            normalized.append({"id": stop_id, "sequence": sequence})
        return normalized


class RouteStopChangeStatusSerializer(serializers.Serializer):
    """Validate route stop change-status payload."""

    status = serializers.ChoiceField(choices=RouteStop.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
