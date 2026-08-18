from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import CustomerProfile, ProviderProfile
from .serializers import (
    CustomerProfileSerializer,
    ProviderProfileSerializer,
    RegisterSerializer,
    UserSerializer,
)


class ProviderProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve provider profiles (public).
    """
    queryset = ProviderProfile.objects.all().select_related('user')
    serializer_class = ProviderProfileSerializer
    permission_classes = [AllowAny]


class CustomerProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Only the logged-in customer can see their own profile.
    """
    queryset = CustomerProfile.objects.all()
    serializer_class = CustomerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomerProfile.objects.filter(user=self.request.user)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyProviderProfileView(APIView):
    """
    Allows a provider to view and update their own profile
    (bio, city, years_of_experience, etc.)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'PROVIDER':
            return Response(
                {"error": "Only providers can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            profile = request.user.provider_profile
            serializer = ProviderProfileSerializer(profile)
            return Response(serializer.data)
        except ProviderProfile.DoesNotExist:
            return Response(
                {"error": "Provider profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request):
        if request.user.role != 'PROVIDER':
            return Response(
                {"error": "Only providers can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            profile = request.user.provider_profile
            serializer = ProviderProfileSerializer(
                profile,
                data=request.data,
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ProviderProfile.DoesNotExist:
            return Response(
                {"error": "Provider profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            

from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
            
            
            