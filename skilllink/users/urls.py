from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, MeView, MyProviderProfileView, ProviderProfileViewSet, CustomerProfileViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'providers', ProviderProfileViewSet, basename='providers')
router.register(r'customers', CustomerProfileViewSet, basename='customers')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('me/provider/', MyProviderProfileView.as_view(), name='my-provider-profile'),
    path('', include(router.urls)),
]



