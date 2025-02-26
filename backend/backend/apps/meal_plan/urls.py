from django.contrib import admin
from django.urls import path
from .views import MealPlanViewSet 

urlpatterns = [
    path('meal-plan', MealPlanViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name="meal-plan-list"),
    path('meal-plan/<str:pk>', MealPlanViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }),name="meal-plan-detail"),
]