"""Tests for report CSV export endpoints."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


class ReportCsvExportTests(TestCase):
    """Ensure protected CSV endpoints return Excel-compatible headers."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(username="demo", password="demo1234")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_csv_export_endpoints_return_attachments_with_expected_headers(self):
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
