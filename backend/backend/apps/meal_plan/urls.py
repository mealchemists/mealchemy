from django.urls import path

from .views import MealPlanAPIView

urlpatterns = [
    path("meal-plan", MealPlanAPIView.as_view(), name="meal_plan"),
    path("meal-plan/<str:pk>", MealPlanAPIView.as_view(), name="meal_plan"),
]
