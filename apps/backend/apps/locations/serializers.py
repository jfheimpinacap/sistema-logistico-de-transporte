"""DRF serializers for location masters."""
from rest_framework import serializers

from apps.locations.models import Address, Warehouse, Zone


class ZoneSerializer(serializers.ModelSerializer):
    """Serialize zones for CRUD APIs."""

    class Meta:
        """Serializer metadata."""

        model = Zone
        fields = ("id", "name", "code", "description", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class AddressSerializer(serializers.ModelSerializer):
    """Serialize addresses for CRUD APIs."""

    zone_name = serializers.CharField(source="zone.name", read_only=True)

    class Meta:
        """Serializer metadata."""

        model = Address
        fields = (
            "id",
            "label",
            "street",
            "number",
            "apartment",
            "commune",
            "city",
            "region",
            "country",
            "postal_code",
            "latitude",
            "longitude",
            "zone",
            "zone_name",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "zone_name", "created_at", "updated_at")


class WarehouseSerializer(serializers.ModelSerializer):
    """Serialize warehouses for CRUD APIs."""

    address_label = serializers.CharField(source="address.label", read_only=True)

    class Meta:
        """Serializer metadata."""

        model = Warehouse
        fields = (
            "id",
            "name",
            "code",
            "address",
            "address_label",
            "phone",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "address_label", "created_at", "updated_at")
