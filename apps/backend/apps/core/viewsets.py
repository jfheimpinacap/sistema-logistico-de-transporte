"""Reusable API viewset helpers."""
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated


class MasterDataViewSet(viewsets.ModelViewSet):
    """Base viewset for authenticated master-data CRUD APIs.

    Supports a lightweight `search` query parameter over `search_fields`, an
    `is_active` boolean filter when the model exposes that field, and soft delete
    by setting `is_active=False` instead of removing rows.
    """

    permission_classes = [IsAuthenticated]
    search_fields: tuple[str, ...] = ()

    def get_queryset(self):
        """Return the queryset with optional search and active-state filters."""
        queryset = super().get_queryset()
        is_active = self.request.query_params.get("is_active")
        if is_active is not None and any(field.name == "is_active" for field in queryset.model._meta.fields):
            normalized = is_active.strip().lower()
            if normalized in {"1", "true", "t", "yes", "y", "on"}:
                queryset = queryset.filter(is_active=True)
            elif normalized in {"0", "false", "f", "no", "n", "off"}:
                queryset = queryset.filter(is_active=False)

        search = self.request.query_params.get("search", "").strip()
        if search and self.search_fields:
            query = Q()
            for field in self.search_fields:
                query |= Q(**{f"{field}__icontains": search})
            queryset = queryset.filter(query)

        return queryset

    def perform_destroy(self, instance):
        """Soft-delete active master rows when possible."""
        if hasattr(instance, "is_active"):
            instance.is_active = False
            instance.save(update_fields=["is_active", "updated_at"])
            return
        super().perform_destroy(instance)
