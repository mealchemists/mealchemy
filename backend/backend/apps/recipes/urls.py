from django.contrib import admin
from django.urls import path
from .views import RecipeViewSet, IngredientViewSet, MealplanViewSet

urlpatterns = [
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
        path('mealplan', MealplanViewSet.as_view({
        'get': 'list',
        'post': 'create',
    })),
    path('mealplan/<str:pk>', MealplanViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    })),
]