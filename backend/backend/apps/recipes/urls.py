from django.contrib import admin
from django.urls import path
from .views import RecipeViewSet

urlpatterns = [
    path('recipe', RecipeViewSet.as_view({
        'get': 'list',
        'post': 'create',
    })),
    path('recipe/<str:pk>', RecipeViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    })),
]