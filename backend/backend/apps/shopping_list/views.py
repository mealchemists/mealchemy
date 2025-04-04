from django.shortcuts import render
from rest_framework.views import APIView

from backend.apps.recipes.serializers import RecipeSerializer
from .models.shopping_list import ShoppingList
from backend.apps.recipes.models import Recipe, Ingredient, RecipeIngredient
from django.contrib.auth.models import User
from django.forms.models import model_to_dict

from rest_framework import status
from collections import defaultdict

from .serializers import ShoppingListSerializer
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from ..recipes.models.units import Quantity, Unit


# Create your views here.
class ShoppingListView(APIView):
    def get(self, request, user_id):
        if request.GET.get("type") == "aisleIngredients":
            get_object_or_404(User, id=user_id)
            shopping_list = ShoppingList.objects.filter(user_id=user_id).select_related(
                "ingredient"
            )

            # Organize by aisle name
            aisle_dict = defaultdict(list)
            for item in shopping_list:
                aisle_name = item.ingredient.ingredient.aisle.name
                ingredient_name = item.ingredient.ingredient.name
                unit_label = item.ingredient.unit

                try:
                    unit_enum = Unit.from_label(unit_label)
                except ValueError:
                    unit_enum = Unit.COUNT

                try:
                    # Use float() to handle decimal quantities
                    ingredient_quantity = float(item.ingredient.quantity)
                except ValueError:
                    ingredient_quantity = 0

                quantity = Quantity(ingredient_quantity, unit_enum)

                # Check if the ingredient already exists in the aisle
                ingredient_exists = False
                for ingredient in aisle_dict[aisle_name]:
                    # TODO: Fuzzy matching?
                    if ingredient["name"] == ingredient_name:
                        # If the ingredient exists, add the quantity to the existing one
                        ingredient["quantity"] += quantity.to_si()
                        ingredient_exists = True
                        break

                # If the ingredient doesn't exist, add a new entry
                if not ingredient_exists:
                    # aisle_dict[aisle_name].append({
                    #     "name": ingredient_name,
                    #     "quantity": ingredient_quantity,
                    #     "unit": unit
                    # })
                    aisle_dict[aisle_name].append(
                        {
                            **model_to_dict(item.ingredient.ingredient),
                            "quantity": ingredient_quantity,
                            # TODO: Get SI unit of the ingredient quantity
                            "unit": unit_label,
                        }
                    )

            formatted_shopping_list = [
                {"aisle": aisle, "items": ingredients}
                for aisle, ingredients in aisle_dict.items()
            ]
            return Response(formatted_shopping_list)
        else:
            # return the recipes associated with the ingredients
            # Get the ingredient IDs from the user's shopping list
            # ingredients in shopping_list is actually recipe_ingredient
            shopping_list_ingredient_ids = ShoppingList.objects.filter(
                user_id=user_id
            ).values_list("ingredient_id", flat=True)

            print(shopping_list_ingredient_ids.first())

            # Get recipes where the ingredients exist in the shopping list
            recipes = (
                RecipeIngredient.objects.filter(id__in=shopping_list_ingredient_ids)
                .values_list("recipe", flat=True)
                .distinct()
            )

            # Get the unique recipes
            matching_recipes = Recipe.objects.filter(id__in=recipes)

            serialized_recipes = RecipeSerializer(matching_recipes, many=True)

            return Response(serialized_recipes.data)

    def post(self, request, user_id):
        # request contains a list of recipe_ids
        recipe_ids = request.data.get("recipe_ids", [])
        if not isinstance(recipe_ids, list) or not recipe_ids:
            return Response(
                {"error": "Invalid or empty recipe_ids list"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_object_or_404(User, id=user_id)
        recipe_ingredients = RecipeIngredient.objects.filter(recipe_id__in=recipe_ids)
        shopping_list_entries = []

        for recipe_ingredient in recipe_ingredients:
            ingredient = recipe_ingredient
            shopping_list_entries.append(ShoppingList(ingredient=ingredient, user=user))
        ShoppingList.objects.bulk_create(shopping_list_entries)
        return Response(
            {"message": "Ingredients added to shopping list"},
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, user_id):
        # removing recipes
        recipe_ids = request.data.get("recipe_ids", [])
        if not isinstance(recipe_ids, list) or not recipe_ids:
            return Response(
                {"error": "Invalid or empty recipe_ids list"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        shopping_list = ShoppingList.objects.filter(user_id=user_id).select_related(
            "ingredient"
        )

        user = get_object_or_404(User, id=user_id)

        shopping_list.filter(ingredient__recipe_id__in=recipe_ids).delete()

        return Response(
            {"message": f"Deleted items from the shopping list"},
            status=status.HTTP_200_OK,
        )
