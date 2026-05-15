"""DRF serializers for operational logistics APIs."""
from rest_framework import serializers

from apps.logistics.models import Package, Shipment, TrackingEvent


class LatestTrackingEventSerializer(serializers.ModelSerializer):
    """Small nested representation for the latest shipment event."""

    class Meta:
        """Serializer metadata."""

        model = TrackingEvent
        fields = ("id", "status", "event_type", "title", "location_text", "occurred_at")
        read_only_fields = fields


class ShipmentSerializer(serializers.ModelSerializer):
    """Serialize shipments for CRUD APIs."""

    customer_name = serializers.CharField(source="customer.name", read_only=True)
    origin_address_label = serializers.CharField(source="origin_address.label", read_only=True)
    destination_address_label = serializers.CharField(source="destination_address.label", read_only=True)
    origin_warehouse_name = serializers.CharField(source="origin_warehouse.name", read_only=True)
    package_count_real = serializers.IntegerField(read_only=True)
    latest_event = serializers.SerializerMethodField()

    class Meta:
        """Serializer metadata."""

        model = Shipment
        fields = (
            "id",
            "tracking_code",
            "external_reference",
            "customer",
            "customer_name",
            "origin_address",
            "origin_address_label",
            "destination_address",
            "destination_address_label",
            "origin_warehouse",
            "origin_warehouse_name",
            "sender_name",
            "sender_phone",
            "sender_email",
            "recipient_name",
            "recipient_phone",
            "recipient_email",
            "description",
            "package_count",
            "package_count_real",
            "total_weight_kg",
            "total_volume_m3",
            "priority",
            "service_type",
            "current_status",
            "requested_delivery_date",
            "delivery_window_start",
            "delivery_window_end",
            "received_at",
            "delivered_at",
            "notes",
            "is_active",
            "latest_event",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "customer_name",
            "origin_address_label",
            "destination_address_label",
            "origin_warehouse_name",
            "package_count_real",
            "latest_event",
            "created_at",
            "updated_at",
        )

    def get_latest_event(self, obj):
        """Return the latest tracking event when already available or cheaply fetched."""
        prefetched_events = getattr(obj, "prefetched_tracking_events", None)
        event = prefetched_events[0] if prefetched_events else None
        if event is None:
            event = obj.tracking_events.order_by("-occurred_at", "-created_at", "-id").first()
        if not event:
            return None
        return LatestTrackingEventSerializer(event).data


class PackageSerializer(serializers.ModelSerializer):
    """Serialize shipment packages for CRUD APIs."""

    shipment_tracking_code = serializers.CharField(source="shipment.tracking_code", read_only=True)

    class Meta:
        """Serializer metadata."""

        model = Package
        fields = (
            "id",
            "shipment",
            "shipment_tracking_code",
            "package_code",
            "description",
            "weight_kg",
            "length_cm",
            "width_cm",
            "height_cm",
            "volume_m3",
            "declared_value",
            "barcode",
            "status",
            "is_fragile",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "shipment_tracking_code", "created_at", "updated_at")


class TrackingEventSerializer(serializers.ModelSerializer):
    """Serialize tracking events for CRUD APIs."""

    shipment_tracking_code = serializers.CharField(source="shipment.tracking_code", read_only=True)
    package_code = serializers.CharField(source="package.package_code", read_only=True)
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        """Serializer metadata."""

        model = TrackingEvent
        fields = (
            "id",
            "shipment",
            "shipment_tracking_code",
            "package",
            "package_code",
            "status",
            "event_type",
            "title",
            "description",
            "location_text",
            "warehouse",
            "warehouse_name",
            "created_by",
            "created_by_username",
            "occurred_at",
            "created_at",
        )
        read_only_fields = ("id", "shipment_tracking_code", "package_code", "warehouse_name", "created_by_username", "created_at")


class ShipmentChangeStatusSerializer(serializers.Serializer):
    """Validate the shipment change-status payload."""

    status = serializers.ChoiceField(choices=Shipment.Status.choices)
    title = serializers.CharField(max_length=160)
    description = serializers.CharField(required=False, allow_blank=True)
    location_text = serializers.CharField(max_length=180, required=False, allow_blank=True)
    warehouse = serializers.IntegerField(required=False, allow_null=True)
    occurred_at = serializers.DateTimeField(required=False)
