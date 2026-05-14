"""API viewsets for party masters."""
from apps.core.viewsets import MasterDataViewSet
from apps.parties.models import Contact, Customer
from apps.parties.serializers import ContactSerializer, CustomerSerializer


class CustomerViewSet(MasterDataViewSet):
    """CRUD API for customers."""

    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    search_fields = ("name", "tax_id", "email", "phone", "address_text")


class ContactViewSet(MasterDataViewSet):
    """CRUD API for contacts."""

    queryset = Contact.objects.select_related("customer")
    serializer_class = ContactSerializer
    search_fields = ("name", "email", "phone", "role", "customer__name")
