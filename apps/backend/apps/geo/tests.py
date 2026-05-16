"""Tests for the internal geo utilities and endpoints."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.geo.services.coordinates import has_valid_coordinates, is_valid_latitude, is_valid_longitude
from apps.geo.services.distance import estimate_duration_minutes, haversine_distance_km
from apps.locations.models import Address
from apps.routing.models import Route, RouteStop


class GeoServiceTests(TestCase):
    """Validate coordinate and distance service helpers."""

    def test_coordinate_validation_accepts_boundaries_and_rejects_invalid_values(self):
        self.assertTrue(is_valid_latitude(-90))
        self.assertTrue(is_valid_latitude(90))
        self.assertFalse(is_valid_latitude(91))
        self.assertFalse(is_valid_latitude(None))
        self.assertTrue(is_valid_longitude(-180))
        self.assertTrue(is_valid_longitude(180))
        self.assertFalse(is_valid_longitude(-181))
        self.assertFalse(is_valid_longitude("abc"))

    def test_haversine_distance_between_santiago_points_is_reasonable(self):
        distance_km = haversine_distance_km(-33.448890, -70.669265, -33.426280, -70.617096)
        self.assertIsNotNone(distance_km)
        self.assertGreater(distance_km, 5)
        self.assertLess(distance_km, 7)

    def test_estimate_duration_minutes_uses_average_speed(self):
        self.assertEqual(estimate_duration_minutes(35, average_speed_kmh=35), 60)
        self.assertIsNone(estimate_duration_minutes(10, average_speed_kmh=0))


class GeoEndpointTests(TestCase):
    """Validate authenticated geo API endpoints."""

    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_user(username="geo-demo", password="demo1234")
        cls.address_origin = Address.objects.create(
            label="Test Santiago Centro",
            street="Alameda",
            number="1000",
            commune="Santiago",
            city="Santiago",
            region="Región Metropolitana",
            latitude=-33.448890,
            longitude=-70.669265,
        )
        cls.address_destination = Address.objects.create(
            label="Test Providencia",
            street="Providencia",
            number="1208",
            commune="Providencia",
            city="Santiago",
            region="Región Metropolitana",
            latitude=-33.426280,
            longitude=-70.617096,
        )
        cls.address_missing = Address.objects.create(
            label="Test sin coordenadas",
            street="Sin coordenadas",
            number="1",
            commune="Ñuñoa",
            city="Santiago",
            region="Región Metropolitana",
        )
        cls.route = Route.objects.create(route_code="RUT-GEO-TEST-001", name="Ruta geo test")
        RouteStop.objects.create(route=cls.route, sequence=1, address=cls.address_origin)
        RouteStop.objects.create(route=cls.route, sequence=2, address=cls.address_destination)

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_calculate_distance_with_valid_coordinates(self):
        response = self.client.post(
            "/api/geo/calculate-distance/",
            {
                "from": {"latitude": -33.448890, "longitude": -70.669265},
                "to": {"latitude": -33.426280, "longitude": -70.617096},
                "average_speed_kmh": 35,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["method"], "haversine_linear_estimate")
        self.assertGreater(response.data["distance_km"], 0)
        self.assertIn("Distancia lineal", response.data["warning"])

    def test_calculate_distance_rejects_invalid_coordinates(self):
        response = self.client.post(
            "/api/geo/calculate-distance/",
            {
                "from": {"latitude": -99, "longitude": -70.669265},
                "to": {"latitude": -33.426280, "longitude": -70.617096},
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("from", response.data["errors"])

    def test_address_check_requires_authentication_and_returns_summary(self):
        anonymous_client = APIClient()
        anonymous_response = anonymous_client.get("/api/geo/address-check/")
        self.assertEqual(anonymous_response.status_code, 401)

        response = self.client.get("/api/geo/address-check/")
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(response.data["total_addresses"], 3)
        self.assertGreaterEqual(response.data["with_coordinates"], 2)
        self.assertGreaterEqual(response.data["missing_coordinates"], 1)
        self.assertTrue(has_valid_coordinates(self.address_origin))

    def test_route_distance_summary_returns_segments(self):
        response = self.client.get(f"/api/geo/routes/{self.route.id}/distance-summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["route_id"], self.route.id)
        self.assertEqual(response.data["stops_total"], 2)
        self.assertEqual(response.data["stops_with_coordinates"], 2)
        self.assertEqual(len(response.data["stops"]), 2)
        self.assertEqual(response.data["stops"][0]["sequence"], 1)
        self.assertEqual(len(response.data["segments"]), 1)
        self.assertGreater(response.data["distance_km"], 0)
