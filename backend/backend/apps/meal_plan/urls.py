from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MealPlanAPIView


urlpatterns = [
    path('meal-plan', MealPlanAPIView.as_view(), name='meal_plan'),  
]
