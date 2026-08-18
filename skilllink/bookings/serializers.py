from rest_framework import serializers
from .models import Booking
from users.models import ProviderProfile
from users.serializers import UserSerializer, ProviderProfileSerializer
from services.serializers import ServiceSerializer
from services.models import Service


class BookingSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    provider = ProviderProfileSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)

    # Write-only fields for creating a booking
    provider_id = serializers.PrimaryKeyRelatedField(
        queryset=ProviderProfile.objects.filter(is_verified=True, is_available=True),
        source='provider',
        write_only=True
    )
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.filter(is_active=True),
        source='service',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Booking
        fields = [
            'id',
            'customer',
            'provider',
            'provider_id',
            'service',
            'service_id',
            'title',
            'description',
            'status',
            'scheduled_date',
            'scheduled_time',
            'address',
            'city',
            'price',
            'customer_note',
            'provider_note',
            'created_at',
            'updated_at',
            'completed_at'
        ]
        read_only_fields = ['customer', 'status', 'completed_at']