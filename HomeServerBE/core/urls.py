from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FrameViewSet

router = DefaultRouter()
router.register(r'frames', FrameViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
