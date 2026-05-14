"""Base API views for operational checks."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(_request):
    """Return a minimal response to confirm the backend is running."""
    return Response(
        {
            "status": "ok",
            "service": "sistema-logistico-de-transporte",
            "version": "0.1.0",
        }
    )
