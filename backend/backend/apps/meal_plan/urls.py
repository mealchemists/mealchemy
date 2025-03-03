from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import MealPlanViewSet

router = DefaultRouter()
router.register(r'meal-plan', MealPlanViewSet)

urlpatterns = [
    path('', include(router.urls)),
]