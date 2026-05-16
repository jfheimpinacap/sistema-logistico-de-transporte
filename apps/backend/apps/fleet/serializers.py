"""DRF serializers for fleet masters."""
from rest_framework import serializers

from apps.fleet.models import Driver, Vehicle, VehicleType


class VehicleTypeSerializer(serializers.ModelSerializer):
    """Serialize vehicle types for CRUD APIs."""

    class Meta:
        """Serializer metadata."""

        model = VehicleType
        fields = (
            "id",
            "name",
            "code",
            "description",
            "max_weight_kg",
            "max_volume_m3",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class VehicleSerializer(serializers.ModelSerializer):
    """Serialize vehicles for CRUD APIs."""

    vehicle_type_name = serializers.CharField(source="vehicle_type.name", read_only=True)

    class Meta:
        """Serializer metadata."""

        model = Vehicle
        fields = (
            "id",
            "plate_number",
            "vehicle_type",
            "vehicle_type_name",
            "brand",
            "model",
            "year",
            "capacity_kg",
            "capacity_m3",
            "status",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "vehicle_type_name", "created_at", "updated_at")


class DriverSerializer(serializers.ModelSerializer):
    """Serialize drivers for CRUD APIs."""

    default_vehicle_plate = serializers.CharField(source="default_vehicle.plate_number", read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    driver_type_label = serializers.CharField(source="get_driver_type_display", read_only=True)
    location_source_label = serializers.CharField(source="get_location_source_display", read_only=True)

    class Meta:
        """Serializer metadata."""

        model = Driver
        fields = (
            "id",
            "user",
            "user_username",
            "user_email",
            "first_name",
            "last_name",
            "rut",
            "email",
            "phone",
            "license_class",
            "default_vehicle",
            "default_vehicle_plate",
            "driver_type",
            "driver_type_label",
            "location_source",
            "location_source_label",
            "status",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "user_username",
            "user_email",
            "default_vehicle_plate",
            "driver_type_label",
            "location_source_label",
            "created_at",
            "updated_at",
        )
