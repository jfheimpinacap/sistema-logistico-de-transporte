"""API viewsets for fleet masters."""
from apps.core.viewsets import MasterDataViewSet
from apps.fleet.models import Driver, Vehicle, VehicleType
from apps.fleet.serializers import DriverSerializer, VehicleSerializer, VehicleTypeSerializer


class VehicleTypeViewSet(MasterDataViewSet):
    """CRUD API for vehicle types."""

    queryset = VehicleType.objects.all()
    serializer_class = VehicleTypeSerializer
    search_fields = ("name", "code", "description")


class VehicleViewSet(MasterDataViewSet):
    """CRUD API for vehicles."""

    queryset = Vehicle.objects.select_related("vehicle_type")
    serializer_class = VehicleSerializer
    search_fields = ("plate_number", "brand", "model", "status", "vehicle_type__name")


class DriverViewSet(MasterDataViewSet):
    """CRUD API for drivers."""

    queryset = Driver.objects.select_related("default_vehicle", "user")
    serializer_class = DriverSerializer
    search_fields = ("first_name", "last_name", "rut", "email", "phone", "license_class", "status", "user__username", "user__email")
