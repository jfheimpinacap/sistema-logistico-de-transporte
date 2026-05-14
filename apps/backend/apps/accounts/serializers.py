"""Serializers for account-related API responses."""
from django.contrib.auth import get_user_model
from rest_framework import serializers


class CurrentUserSerializer(serializers.ModelSerializer):
    """Serialize safe profile fields for the authenticated user."""

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
        )
        read_only_fields = fields
