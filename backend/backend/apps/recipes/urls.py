from django.contrib import admin
from django.urls import path
from .views import (
    IngredientViewSet,
    RecipeIngredientsAPIView,
    RecipeViewSet,
    recipe_url,
    recipe_pdf,
    save_scraped_data,
    AisleAPIView,
    get_jwt_token_endpoint,
)

urlpatterns = [
    path(
        "recipe-ingredients/<str:pk>",
        RecipeIngredientsAPIView.as_view(),
        name="recipe-ingredients",
    ),
    path(
        "recipe-ingredients",
        RecipeIngredientsAPIView.as_view(),
        name="recipe-ingredients",
    ),
    path("save-scraped-data/", save_scraped_data, name="save-scraped-data"),
    path("get-jwt-token/<str:user_id>", get_jwt_token_endpoint, name = "jwt-token"),
    path("recipe-url/", recipe_url, name="recipe-url"),
    path("recipe-pdf/", recipe_pdf, name="recipe-pdf"),
    path(
        "recipe",
        RecipeViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="recipe-list",
    ),
    path(
        "recipe/<str:pk>",
        RecipeViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="recipe-detail",
    ),
    path(
        "ingredient",
        IngredientViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="ingredient-list",
    ),
    path(
        "ingredient/<str:pk>",
        IngredientViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="ingredient-detail",
    ),
    path("aisles/<str:user_id>", AisleAPIView.as_view(), name="aisles"),
]

