"""DRF serializers for field operations APIs."""
from rest_framework import serializers

from apps.fieldops.models import DeliveryProof, Incident


class DeliveryProofSerializer(serializers.ModelSerializer):
    """Serialize delivery proof records with lightweight display fields."""

    shipment_tracking_code = serializers.CharField(source="shipment.tracking_code", read_only=True)
    package_code = serializers.CharField(source="package.package_code", read_only=True)
    route_code = serializers.CharField(source="route.route_code", read_only=True)
    route_stop_sequence = serializers.IntegerField(source="route_stop.sequence", read_only=True)
    route_shipment_status = serializers.CharField(source="route_shipment.status", read_only=True)
    created_by_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()

    class Meta:
        """Serializer metadata."""

        model = DeliveryProof
        fields = (
            "id",
            "shipment",
            "shipment_tracking_code",
            "package",
            "package_code",
            "route",
            "route_code",
            "route_stop",
            "route_stop_sequence",
            "route_shipment",
            "route_shipment_status",
            "proof_type",
            "status",
            "received_by_name",
            "received_by_rut",
            "recipient_relationship",
            "delivery_notes",
            "photo",
            "signature_file",
            "signature_text",
            "latitude",
            "longitude",
            "location_accuracy_m",
            "location_text",
            "captured_at",
            "created_by",
            "created_by_name",
            "reviewed_by",
            "reviewed_by_name",
            "reviewed_at",
            "review_notes",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "shipment_tracking_code",
            "package_code",
            "route_code",
            "route_stop_sequence",
            "route_shipment_status",
            "created_by",
            "created_by_name",
            "reviewed_by",
            "reviewed_by_name",
            "reviewed_at",
            "created_at",
            "updated_at",
        )

    def get_created_by_name(self, obj):
        """Return a friendly creator name."""
        return obj.created_by.get_full_name() or obj.created_by.username if obj.created_by else ""

    def get_reviewed_by_name(self, obj):
        """Return a friendly reviewer name."""
        return obj.reviewed_by.get_full_name() or obj.reviewed_by.username if obj.reviewed_by else ""

    def validate(self, attrs):
        """Validate basic relationship consistency without complex workflows."""
        shipment = attrs.get("shipment") or getattr(self.instance, "shipment", None)
        package = attrs.get("package") if "package" in attrs else getattr(self.instance, "package", None)
        route = attrs.get("route") if "route" in attrs else getattr(self.instance, "route", None)
        route_stop = attrs.get("route_stop") if "route_stop" in attrs else getattr(self.instance, "route_stop", None)
        route_shipment = attrs.get("route_shipment") if "route_shipment" in attrs else getattr(self.instance, "route_shipment", None)

        if package and shipment and package.shipment_id != shipment.id:
            raise serializers.ValidationError({"package": "El bulto debe pertenecer a la encomienda indicada."})
        if route_stop and route and route_stop.route_id != route.id:
            raise serializers.ValidationError({"route_stop": "La parada debe pertenecer a la ruta indicada."})
        if route_shipment:
            if shipment and route_shipment.shipment_id != shipment.id:
                raise serializers.ValidationError({"route_shipment": "La asignación debe pertenecer a la encomienda indicada."})
            if route and route_shipment.route_id != route.id:
                raise serializers.ValidationError({"route_shipment": "La asignación debe pertenecer a la ruta indicada."})
            if route_stop and route_shipment.stop_id and route_shipment.stop_id != route_stop.id:
                raise serializers.ValidationError({"route_shipment": "La asignación debe corresponder a la parada indicada."})
        return attrs


class IncidentSerializer(serializers.ModelSerializer):
    """Serialize operational incidents with lightweight display fields."""

    shipment_tracking_code = serializers.CharField(source="shipment.tracking_code", read_only=True)
    package_code = serializers.CharField(source="package.package_code", read_only=True)
    route_code = serializers.CharField(source="route.route_code", read_only=True)
    route_stop_sequence = serializers.IntegerField(source="route_stop.sequence", read_only=True)
    driver_name = serializers.SerializerMethodField()
    vehicle_plate = serializers.CharField(source="vehicle.plate_number", read_only=True)
    reported_by_name = serializers.SerializerMethodField()
    resolved_by_name = serializers.SerializerMethodField()

    class Meta:
        """Serializer metadata."""

        model = Incident
        fields = (
            "id",
            "shipment",
            "shipment_tracking_code",
            "package",
            "package_code",
            "route",
            "route_code",
            "route_stop",
            "route_stop_sequence",
            "route_shipment",
            "driver",
            "driver_name",
            "vehicle",
            "vehicle_plate",
            "incident_code",
            "category",
            "severity",
            "status",
            "title",
            "description",
            "resolution_notes",
            "location_text",
            "latitude",
            "longitude",
            "evidence_file",
            "occurred_at",
            "resolved_at",
            "reported_by",
            "reported_by_name",
            "resolved_by",
            "resolved_by_name",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "reported_by",
            "reported_by_name",
            "resolved_by",
            "resolved_by_name",
            "resolved_at",
            "created_at",
            "updated_at",
        )

    def get_driver_name(self, obj):
        """Return driver full name."""
        return str(obj.driver) if obj.driver else ""

    def get_reported_by_name(self, obj):
        """Return a friendly reporter name."""
        return obj.reported_by.get_full_name() or obj.reported_by.username if obj.reported_by else ""

    def get_resolved_by_name(self, obj):
        """Return a friendly resolver name."""
        return obj.resolved_by.get_full_name() or obj.resolved_by.username if obj.resolved_by else ""

    def validate(self, attrs):
        """Validate basic relationship consistency without complex workflows."""
        shipment = attrs.get("shipment") if "shipment" in attrs else getattr(self.instance, "shipment", None)
        package = attrs.get("package") if "package" in attrs else getattr(self.instance, "package", None)
        route = attrs.get("route") if "route" in attrs else getattr(self.instance, "route", None)
        route_stop = attrs.get("route_stop") if "route_stop" in attrs else getattr(self.instance, "route_stop", None)
        route_shipment = attrs.get("route_shipment") if "route_shipment" in attrs else getattr(self.instance, "route_shipment", None)

        if package and shipment and package.shipment_id != shipment.id:
            raise serializers.ValidationError({"package": "El bulto debe pertenecer a la encomienda indicada."})
        if route_stop and route and route_stop.route_id != route.id:
            raise serializers.ValidationError({"route_stop": "La parada debe pertenecer a la ruta indicada."})
        if route_shipment:
            if shipment and route_shipment.shipment_id != shipment.id:
                raise serializers.ValidationError({"route_shipment": "La asignación debe pertenecer a la encomienda indicada."})
            if route and route_shipment.route_id != route.id:
                raise serializers.ValidationError({"route_shipment": "La asignación debe pertenecer a la ruta indicada."})
            if route_stop and route_shipment.stop_id and route_shipment.stop_id != route_stop.id:
                raise serializers.ValidationError({"route_shipment": "La asignación debe corresponder a la parada indicada."})
        return attrs


class ReviewNotesSerializer(serializers.Serializer):
    """Validate optional notes for proof review actions."""

    review_notes = serializers.CharField(required=False, allow_blank=True)


class ResolutionNotesSerializer(serializers.Serializer):
    """Validate optional notes for incident close actions."""

    resolution_notes = serializers.CharField(required=False, allow_blank=True)
