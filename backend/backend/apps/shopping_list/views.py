from django.shortcuts import render
from rest_framework.views import APIView
from .models.shopping_list import ShoppingList
from backend.apps.recipes.models import Recipe, Ingredient, RecipeIngredient
from django.contrib.auth.models import User
from django.forms.models import model_to_dict

from rest_framework import status
from collections import defaultdict

from .serializers import ShoppingListSerializer
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

# Create your views here.
class ShoppingListView(APIView):
    def get(self, request, user_id):
        get_object_or_404(User, id=user_id)
        shopping_list = ShoppingList.objects.filter(user_id=user_id).select_related('ingredient')

        # Organize by aisle name
        aisle_dict = defaultdict(list)
        for item in shopping_list:
            aisle_name = item.ingredient.ingredient.aisle.name 
            ingredient_name = item.ingredient.ingredient.name
            unit = item.ingredient.unit
            try:
                ingredient_quantity = float(item.ingredient.quantity)  # Use float() to handle decimal quantities
            except ValueError:
                ingredient_quantity = 0

            # Check if the ingredient already exists in the aisle
            ingredient_exists = False
            for ingredient in aisle_dict[aisle_name]:
                if ingredient["name"] == ingredient_name:
                    # If the ingredient exists, add the quantity to the existing one
                    ingredient["quantity"] += ingredient_quantity
                    ingredient_exists = True
                    break

            # If the ingredient doesn't exist, add a new entry
            if not ingredient_exists:
                # aisle_dict[aisle_name].append({
                #     "name": ingredient_name,
                #     "quantity": ingredient_quantity,
                #     "unit": unit
                # })
                aisle_dict[aisle_name].append({
                    **model_to_dict(item.ingredient.ingredient), 
                    "quantity": ingredient_quantity,
                    "unit": unit
                })

        formatted_shopping_list = [
            {"aisle": aisle, "items": ingredients}
            for aisle, ingredients in aisle_dict.items()
        ]
        return Response({"shopping_list": formatted_shopping_list})

    def post(self, request, user_id):
        # request contains a list of recipe_ids
        recipe_ids = request.data.get("recipe_ids", [])
        if not isinstance(recipe_ids, list) or not recipe_ids:
            return Response({"error": "Invalid or empty recipe_ids list"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(User, id=user_id)
        recipe_ingredients = RecipeIngredient.objects.filter(recipe_id__in=recipe_ids)
        shopping_list_entries = []

        for recipe_ingredient in recipe_ingredients:
            ingredient = recipe_ingredient
            shopping_list_entries.append(ShoppingList(ingredient=ingredient, user=user))
        ShoppingList.objects.bulk_create(shopping_list_entries)
        return Response({"message": "Ingredients added to shopping list"}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, user_id):
        # removing recipes
        recipe_ids = request.data.get("recipe_ids", [])
        if not isinstance(recipe_ids, list) or not recipe_ids:
            return Response({"error": "Invalid or empty recipe_ids list"}, status=status.HTTP_400_BAD_REQUEST)
        shopping_list = ShoppingList.objects.filter(user_id=user_id).select_related('ingredient')

        user = get_object_or_404(User, id=user_id)

        shopping_list.filter(ingredient__recipe_id__in=recipe_ids).delete()


        return Response(
            {"message": f"Deleted items from the shopping list"},
            status=status.HTTP_200_OK
        )

