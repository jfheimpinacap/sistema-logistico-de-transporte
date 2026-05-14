"""DRF serializers for customer and contact masters."""
from rest_framework import serializers

from apps.parties.models import Contact, Customer


class CustomerSerializer(serializers.ModelSerializer):
    """Serialize customers for CRUD APIs."""

    class Meta:
        """Serializer metadata."""

        model = Customer
        fields = (
            "id",
            "name",
            "tax_id",
            "email",
            "phone",
            "address_text",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class ContactSerializer(serializers.ModelSerializer):
    """Serialize customer contacts for CRUD APIs."""

    customer_name = serializers.CharField(source="customer.name", read_only=True)

    class Meta:
        """Serializer metadata."""

        model = Contact
        fields = (
            "id",
            "customer",
            "customer_name",
            "name",
            "email",
            "phone",
            "role",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "customer_name", "created_at", "updated_at")
