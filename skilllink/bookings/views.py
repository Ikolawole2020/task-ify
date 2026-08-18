from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Booking
from .serializers import BookingSerializer
from users.models import create_notification


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'PROVIDER':
            return Booking.objects.filter(provider__user=user).select_related(
                'customer', 'provider__user', 'service'
            )
        
        return Booking.objects.filter(customer=user).select_related(
            'customer', 'provider__user', 'service'
        )

    def perform_create(self, serializer):
        booking = serializer.save(customer=self.request.user)

        # Notify the provider about the new booking request
        create_notification(
            user=booking.provider.user,
            title="New Booking Request",
            message=f"{self.request.user.username} requested your service: {booking.title or booking.service.title}"
        )

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        booking = self.get_object()
        if request.user.role != 'PROVIDER' or booking.provider.user != request.user:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        
        booking.status = Booking.Status.ACCEPTED
        booking.save()

        # Notify the customer
        create_notification(
            user=booking.customer,
            title="Booking Accepted",
            message=f"Your booking for '{booking.title or booking.service.title}' has been accepted."
        )

        return Response({"message": "Booking accepted", "status": booking.status})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        booking = self.get_object()
        if request.user.role != 'PROVIDER' or booking.provider.user != request.user:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        
        booking.status = Booking.Status.CANCELLED
        booking.save()

        # Notify the customer
        create_notification(
            user=booking.customer,
            title="Booking Declined",
            message=f"Your booking for '{booking.title or booking.service.title}' was declined."
        )

        return Response({"message": "Booking rejected", "status": booking.status})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        booking = self.get_object()
        if request.user.role != 'PROVIDER' or booking.provider.user != request.user:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        
        booking.status = Booking.Status.COMPLETED
        booking.completed_at = timezone.now()
        booking.save()

        # Update provider's completed jobs count
        provider = booking.provider
        provider.total_jobs_completed += 1
        provider.save(update_fields=['total_jobs_completed'])

        # Notify the customer
        create_notification(
            user=booking.customer,
            title="Job Completed",
            message=f"Your booking for '{booking.title or booking.service.title}' has been marked as completed. You can now leave a review."
        )

        return Response({"message": "Booking marked as completed", "status": booking.status})