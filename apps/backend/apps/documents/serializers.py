"""Serializers for internal logistics documents."""
from rest_framework import serializers

from apps.documents.models import LogisticsDocument, LogisticsDocumentLine


class LogisticsDocumentSerializer(serializers.ModelSerializer):
    """Serializer for internal logistics documents with display fields only."""

    document_type_label = serializers.CharField(source="get_document_type_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    route_code = serializers.CharField(source="route.route_code", read_only=True)
    shipment_tracking_code = serializers.CharField(source="shipment.tracking_code", read_only=True)
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    driver_name = serializers.SerializerMethodField()
    vehicle_plate = serializers.CharField(source="vehicle.plate_number", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)
    issued_by_name = serializers.CharField(source="issued_by.username", read_only=True)
    cancelled_by_name = serializers.CharField(source="cancelled_by.username", read_only=True)

    class Meta:
        """Serializer metadata."""

        model = LogisticsDocument
        fields = [
            "id",
            "document_number",
            "document_type",
            "document_type_label",
            "status",
            "status_label",
            "customer",
            "route",
            "shipment",
            "warehouse",
            "driver",
            "vehicle",
            "delivery_proof",
            "incident",
            "title",
            "description",
            "issue_date",
            "issued_at",
            "cancelled_at",
            "archived_at",
            "origin_text",
            "destination_text",
            "customer_name_snapshot",
            "driver_name_snapshot",
            "vehicle_plate_snapshot",
            "route_code_snapshot",
            "shipment_tracking_code_snapshot",
            "notes",
            "internal_observations",
            "external_reference",
            "sii_reference",
            "total_shipments",
            "total_packages",
            "total_weight_kg",
            "total_volume_m3",
            "created_by",
            "issued_by",
            "cancelled_by",
            "attachment",
            "is_active",
            "created_at",
            "updated_at",
            "customer_name",
            "route_code",
            "shipment_tracking_code",
            "warehouse_name",
            "driver_name",
            "vehicle_plate",
            "created_by_name",
            "issued_by_name",
            "cancelled_by_name",
        ]
        read_only_fields = [
            "issued_at",
            "cancelled_at",
            "archived_at",
            "created_by",
            "issued_by",
            "cancelled_by",
            "created_at",
            "updated_at",
        ]

    def get_driver_name(self, obj):
        """Return linked driver display name."""
        return str(obj.driver) if obj.driver else ""


class LogisticsDocumentLineSerializer(serializers.ModelSerializer):
    """Serializer for logistics document lines."""

    shipment_tracking_code = serializers.CharField(source="shipment.tracking_code", read_only=True)
    package_code = serializers.CharField(source="package.package_code", read_only=True)
    route_stop_sequence = serializers.IntegerField(source="route_stop.sequence", read_only=True)

    class Meta:
        """Serializer metadata."""

        model = LogisticsDocumentLine
        fields = [
            "id",
            "document",
            "line_number",
            "shipment",
            "package",
            "route_stop",
            "description",
            "quantity",
            "weight_kg",
            "volume_m3",
            "reference_code",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
            "shipment_tracking_code",
            "package_code",
            "route_stop_sequence",
        ]
        read_only_fields = ["created_at", "updated_at"]
