"""Tests for route APIs including authenticated driver route views."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.fleet.models import Driver
from apps.fleet.serializers import DriverSerializer
from apps.routing.models import Route


class DriverUserRouteApiTests(TestCase):
    """Validate User ↔ Driver association exposure and my-routes filtering."""

    def setUp(self):
        """Create isolated users, drivers and routes for API checks."""
        user_model = get_user_model()
        self.demo_user = user_model.objects.create_user(username="demo", password="demo1234", email="demo@example.com")
        self.driver_user = user_model.objects.create_user(
            username="conductor",
            password="conductor1234",
            email="conductor@example.com",
            first_name="Conductor",
            last_name="Demo",
        )
        self.driver = Driver.objects.create(
            user=self.driver_user,
            first_name="Conductor",
            last_name="Demo",
            rut="33.333.333-3",
            email="conductor@example.com",
            phone="+56 9 5555 0000",
            driver_type=Driver.DriverType.EXTERNAL,
            location_source=Driver.LocationSource.MOBILE_WEB,
            status=Driver.Status.AVAILABLE,
        )
        self.other_driver = Driver.objects.create(
            first_name="Otro",
            last_name="Conductor",
            rut="44.444.444-4",
            driver_type=Driver.DriverType.INTERNAL,
            location_source=Driver.LocationSource.MANUAL,
        )
        self.my_route = Route.objects.create(
            route_code="RUT-TEST-MINE",
            name="Mi ruta asignada",
            driver=self.driver,
            status=Route.Status.ASSIGNED,
            is_active=True,
        )
        self.other_route = Route.objects.create(
            route_code="RUT-TEST-OTHER",
            name="Ruta de otro conductor",
            driver=self.other_driver,
            status=Route.Status.ASSIGNED,
            is_active=True,
        )
        self.inactive_route = Route.objects.create(
            route_code="RUT-TEST-INACTIVE",
            name="Ruta inactiva propia",
            driver=self.driver,
            status=Route.Status.ASSIGNED,
            is_active=False,
        )
        self.client = APIClient()

    def test_auth_me_returns_null_driver_profile_for_user_without_driver(self):
        """Current-user endpoint exposes driver_profile=null for non-driver users."""
        self.client.force_authenticate(self.demo_user)

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["driver_profile"])

    def test_auth_me_returns_driver_profile_for_linked_driver_user(self):
        """Current-user endpoint exposes the linked Driver profile."""
        self.client.force_authenticate(self.driver_user)

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["driver_profile"]["id"], self.driver.id)
        self.assertEqual(response.data["driver_profile"]["driver_type"], Driver.DriverType.EXTERNAL)
        self.assertEqual(response.data["driver_profile"]["location_source"], Driver.LocationSource.MOBILE_WEB)

    def test_my_routes_without_driver_profile_returns_empty_results_and_message(self):
        """Users without a linked Driver get a friendly empty response instead of 403."""
        self.client.force_authenticate(self.demo_user)

        response = self.client.get("/api/routes/my-routes/")

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["driver_profile"])
        self.assertEqual(response.data["results"], [])
        self.assertIn("no tiene conductor asociado", response.data["message"])

    def test_my_routes_with_driver_profile_returns_only_own_active_routes(self):
        """Linked drivers see their own active assigned routes only by default."""
        self.client.force_authenticate(self.driver_user)

        response = self.client.get("/api/routes/my-routes/")

        self.assertEqual(response.status_code, 200)
        returned_ids = {item["id"] for item in response.data["results"]}
        self.assertIn(self.my_route.id, returned_ids)
        self.assertNotIn(self.other_route.id, returned_ids)
        self.assertNotIn(self.inactive_route.id, returned_ids)
        self.assertEqual(response.data["driver_profile"]["id"], self.driver.id)

    def test_driver_serializer_exposes_user_and_driver_location_metadata(self):
        """Driver serializer includes linked user and location metadata fields."""
        data = DriverSerializer(self.driver).data

        self.assertEqual(data["user"], self.driver_user.id)
        self.assertEqual(data["user_username"], "conductor")
        self.assertEqual(data["user_email"], "conductor@example.com")
        self.assertEqual(data["driver_type"], Driver.DriverType.EXTERNAL)
        self.assertEqual(data["location_source"], Driver.LocationSource.MOBILE_WEB)
