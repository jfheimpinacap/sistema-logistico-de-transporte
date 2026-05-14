"""Authentication and current-user API views."""
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.serializers import CurrentUserSerializer


class CurrentUserView(APIView):
    """Return basic data for the authenticated user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Serialize and return the current authenticated user."""
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)
