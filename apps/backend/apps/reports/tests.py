"""Smoke tests for MVP operational APIs and CSV export endpoints."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


class OperationalApiSmokeTests(TestCase):
    """Validate basic availability, auth boundaries and protected API reads."""

    @classmethod
    def setUpTestData(cls):
        cls.username = "demo"
        cls.password = "demo1234"
        cls.user = get_user_model().objects.create_user(username=cls.username, password=cls.password)

    def setUp(self):
        self.client = APIClient()

    def test_health_endpoint_is_public(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ok")

    def test_demo_user_can_obtain_jwt_pair(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": self.username, "password": self.password},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_main_operational_endpoints_require_authentication(self):
        protected_urls = [
            "/api/shipments/",
            "/api/routes/",
            "/api/incidents/",
            "/api/documents/",
            "/api/reports/overview/",
        ]

        for url in protected_urls:
            with self.subTest(url=url):
                response = self.client.get(url)
                self.assertEqual(response.status_code, 401)

    def test_authenticated_user_can_open_key_operational_endpoints(self):
        self.client.force_authenticate(user=self.user)
        protected_urls = [
            "/api/shipments/",
            "/api/routes/",
            "/api/incidents/",
            "/api/documents/",
            "/api/reports/overview/",
        ]

        for url in protected_urls:
            with self.subTest(url=url):
                response = self.client.get(url)
                self.assertEqual(response.status_code, 200)

    def test_csv_export_endpoints_return_attachments_with_expected_headers(self):
        self.client.force_authenticate(user=self.user)
        cases = [
            ("/api/reports/export/shipments.csv", "Código tracking"),
            ("/api/reports/export/routes.csv", "Código ruta"),
            ("/api/reports/export/incidents.csv", "Código incidencia"),
            ("/api/reports/export/documents.csv", "Número documento"),
            ("/api/reports/export/driver-performance.csv", "ID conductor"),
            ("/api/reports/export/vehicle-usage.csv", "ID vehículo"),
        ]

        for url, expected_header in cases:
            with self.subTest(url=url):
                response = self.client.get(url)
                self.assertEqual(response.status_code, 200)
                self.assertIn("text/csv", response["Content-Type"])
                self.assertIn("attachment;", response["Content-Disposition"])
                self.assertIn(".csv", response["Content-Disposition"])
                self.assertIn(expected_header, response.content.decode("utf-8-sig"))
