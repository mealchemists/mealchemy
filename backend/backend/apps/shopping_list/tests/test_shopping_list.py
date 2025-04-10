from datetime import date, datetime, timedelta
import random
import uuid
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from backend.apps.meal_plan.models.meal_plan import MealPlan
from backend.apps.recipes.models.recipe import Recipe  
from backend.apps.recipes.models.ingredients import RecipeIngredient, Ingredient, Aisle
from backend.apps.shopping_list.models import ShoppingList
from django.contrib.auth.models import User

from backend.apps.recipes.models.units import Unit


class ShoppingListViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.login(username="testuser", password="testpass")

        self.recipe = Recipe.objects.create(user=self.user, name="Test Recipe")
        self.aisle = Aisle.objects.create(name="Produce")
        self.ingredient = Ingredient.objects.create(
            user = self.user,
            name="Carrot",
            nutrients = {}
            # calories_per_100g=random.uniform(50, 500),
            # protein_per_100g=random.uniform(1, 30),
            # carbs_per_100g=random.uniform(1, 50),
            # sugar_per_100g=random.uniform(0, 30),
            # fat_per_100g=random.uniform(0, 20),
            # sodium_per_100mg=random.uniform(0, 1500),
            # fiber_per_100g=random.uniform(0, 15),
        )
        self.recipe_ingredient = RecipeIngredient.objects.create(
            recipe=self.recipe,
            ingredient=self.ingredient,
            quantity=2,
            unit=Unit.GRAM.label
        )
        self.shopping_item = ShoppingList.objects.create(
            user=self.user, ingredient=self.recipe_ingredient
        )
        self.url = reverse("shopping-list", kwargs={"user_id": self.user.id})  # adjust name

    def test_get_aisle_ingredients(self):
        response = self.client.get(self.url, {"type": "aisleIngredients"})
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)

        # One aisle with one ingredient
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['aisle'], "Uncategorized")
        self.assertEqual(response.data[0]['items'][0]['name'], "Carrot")
        self.assertEqual(response.data[0]['items'][0]['unit'], Unit.GRAM.label)
        
    def test_get_recipes_from_shopping_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.recipe.id)
        self.assertEqual(response.data[0]['name'], self.recipe.name)

    def test_post_add_ingredients_to_shopping_list(self):
        ShoppingList.objects.all().delete()  # Clear initial item

        data = {"recipe_ids": [self.recipe.id]}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(ShoppingList.objects.filter(user=self.user).count(), 1)
    
    def test_post_invalid_recipe_ids(self):
        response = self.client.post(self.url, {"recipe_ids": "notalist"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)
        
    def test_delete_ingredients_from_shopping_list(self):
        data = {"recipe_ids": [self.recipe.id]}
        response = self.client.delete(self.url, data, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(ShoppingList.objects.filter(user=self.user).count(), 0)

    def test_delete_invalid_recipe_ids(self):
        response = self.client.delete(self.url, {"recipe_ids": "invalid"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)
