"""API viewsets for location masters."""
from apps.core.viewsets import MasterDataViewSet
from apps.locations.models import Address, Warehouse, Zone
from apps.locations.serializers import AddressSerializer, WarehouseSerializer, ZoneSerializer


class ZoneViewSet(MasterDataViewSet):
    """CRUD API for zones."""

    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer
    search_fields = ("name", "code", "description")


class AddressViewSet(MasterDataViewSet):
    """CRUD API for addresses."""

    queryset = Address.objects.select_related("zone")
    serializer_class = AddressSerializer
    search_fields = ("label", "street", "commune", "city", "region", "zone__name")


class WarehouseViewSet(MasterDataViewSet):
    """CRUD API for warehouses."""

    queryset = Warehouse.objects.select_related("address")
    serializer_class = WarehouseSerializer
    search_fields = ("name", "code", "phone", "address__label")
