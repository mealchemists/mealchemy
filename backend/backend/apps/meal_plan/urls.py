from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MealPlanViewSet

router = DefaultRouter()
router.register(r'meal-plan', MealPlanViewSet)

urlpatterns = [
    path('', include(router.urls)),
]