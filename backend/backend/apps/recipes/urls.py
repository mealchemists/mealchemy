from django.contrib import admin
from django.urls import path
from .views import RecipeViewSet, save_scraped_data, recipe_url

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
    path('save-scraped-data/', save_scraped_data, name='save-scraped-data'),
    path('recipe-url/', recipe_url, name='recipe-url'),
]