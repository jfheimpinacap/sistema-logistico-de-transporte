"""Serializers for account-related API responses."""
from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.fleet.models import Driver


class CurrentUserDriverProfileSerializer(serializers.ModelSerializer):
    """Serialize the driver profile linked to the current user, when present."""

    class Meta:
        """Serializer metadata."""

        model = Driver
        fields = (
            "id",
            "first_name",
            "last_name",
            "rut",
            "phone",
            "driver_type",
            "location_source",
            "status",
            "default_vehicle",
        )
        read_only_fields = fields


class CurrentUserSerializer(serializers.ModelSerializer):
    """Serialize safe profile fields for the authenticated user."""

    driver_profile = serializers.SerializerMethodField()

    class Meta:
        """Serializer metadata."""

        model = get_user_model()
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_superuser",
            "driver_profile",
        )
        read_only_fields = fields

    def get_driver_profile(self, user):
        """Return linked driver data or null for non-driver users."""
        try:
            driver = user.driver_profile
        except Driver.DoesNotExist:
            return None
        return CurrentUserDriverProfileSerializer(driver).data
