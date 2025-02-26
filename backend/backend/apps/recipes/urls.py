from django.contrib import admin
from django.urls import path
from .views import RecipeViewSet, IngredientViewSet, save_scraped_data, recipe_url, RecipeIngredientViewSet

urlpatterns = [
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
    })),
    path('recipe-ingredient', RecipeIngredientViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name="ingredient-list"),
    path('recipe-ingredient/<str:pk>', RecipeIngredientViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    })),
]