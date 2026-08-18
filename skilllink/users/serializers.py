from rest_framework import serializers
from .models import User, CustomerProfile, ProviderProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'role',
            'profile_picture',
        ]
        read_only_fields = ['id', 'username', 'email', 'role']


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CustomerProfile
        fields = ['id', 'user', 'address', 'city', 'created_at']


class SimpleServiceSerializer(serializers.ModelSerializer):
    """Lightweight service serializer to avoid circular imports"""
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        from services.models import Service
        model = Service
        fields = [
            'id', 'title', 'description', 'price',
            'duration_hours', 'category_name', 'is_active'
        ]


class ProviderProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    services = serializers.SerializerMethodField()

    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'user', 'bio', 'years_of_experience', 'is_available',
            'is_verified', 'city', 'address', 'average_rating',
            'total_reviews', 'total_jobs_completed', 'created_at', 'services'
        ]

    def get_services(self, obj):
        services = obj.services.filter(is_active=True)
        return SimpleServiceSerializer(services, many=True).data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone_number', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            role=validated_data['role']
        )
        return user
    


from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']


