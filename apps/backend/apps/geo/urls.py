"""URL routes for internal geo diagnostic APIs."""
from django.urls import path

from apps.geo.views import AddressCheckView, CalculateDistanceView, RouteDistanceSummaryView, RouteUpdateEstimatesView

urlpatterns = [
    path("geo/address-check/", AddressCheckView.as_view(), name="geo-address-check"),
    path("geo/calculate-distance/", CalculateDistanceView.as_view(), name="geo-calculate-distance"),
    path("geo/routes/<int:route_id>/distance-summary/", RouteDistanceSummaryView.as_view(), name="geo-route-distance-summary"),
    path("geo/routes/<int:route_id>/update-estimates/", RouteUpdateEstimatesView.as_view(), name="geo-route-update-estimates"),
]
