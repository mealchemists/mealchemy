from backend.apps.meal_plan.models.meal_plan import MealPlan
from backend.apps.recipes.models.ingredients import (Aisle, Ingredient,
                                                     RecipeIngredient)

from backend.apps.recipes.models.recipe import Recipe


# Delete all records from RecipeIngredient, Ingredient, and Recipe
RecipeIngredient.objects.all().delete()
Ingredient.objects.all().delete()
Recipe.objects.all().delete()
MealPlan.objects.all().delete()
Aisle.objects.all().delete()

print("Cleanup completed: All records removed.")