from django.contrib import admin
from django.urls import path

from .views import (IngredientViewSet, RecipeIngredientsAPIView, RecipeViewSet,
                    recipe_url, save_scraped_data)

urlpatterns = [
    path('recipe-ingredients/<str:pk>', RecipeIngredientsAPIView.as_view(), name='recipe-ingredients'),
    path('recipe-ingredients', RecipeIngredientsAPIView.as_view(), name='recipe-ingredients'),
    path('save-scraped-data/', save_scraped_data, name='save-scraped-data'),
    path('recipe-url/', recipe_url, name='recipe-url'),
    path('recipe', RecipeViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name="recipe-list"),
    path('recipe/<str:pk>', RecipeViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }),name="recipe-detail"),
    path('ingredient', IngredientViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name="ingredient-list"),
    path('ingredient/<str:pk>', IngredientViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }),name="ingredient-detail"),
    
]