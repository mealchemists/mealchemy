import random
import uuid
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

from backend.apps.recipes.models.ingredients import Aisle, Ingredient, RecipeIngredient
from backend.apps.recipes.models.recipe import Recipe
from rest_framework.test import APIClient

from backend.apps.recipes.views import get_jwt_token
# from backend.data_generator import create_ingredients

class ExtractorURLAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
    
        # Use a separate client to simulate login and get the JWT token
        login_client = APIClient()
        login_client.login(username="testuser", password="testpass")
        
        # Generate JWT token from your stub view
        self.token = get_jwt_token(self.user.id)
        

        # Use the token-authenticated client for actual test requests
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        # Setup other test data
        self.aisle = Aisle.objects.create(name="Produce", user=self.user)
        self.ingredient = Ingredient.objects.create(
            name="TEST-OBJECT-" + str(uuid.uuid4()),
            nutrients = {}
            # calories_per_100g=random.uniform(50, 500),
            # protein_per_100g=random.uniform(1, 30),
            # carbs_per_100g=random.uniform(1, 50),
            # sugar_per_100g=random.uniform(0, 30),
            # fat_per_100g=random.uniform(0, 20),
            # sodium_per_100mg=random.uniform(0, 1500),
            # fiber_per_100g=random.uniform(0, 15),
        )
        self.recipe = Recipe.objects.create(user=self.user, name="Tomato Soup")
        self.recipe_ingredient = RecipeIngredient.objects.create(
            recipe=self.recipe,
            ingredient=self.ingredient,
            quantity=2,
            unit="cups",
            display_name="Chopped Tomatoes"
        )
        self.url = reverse("save-scraped-data")

    def test_post_new_recipe_with_ingredients(self):
        payload = {
            "recipe": {
                "name": "Salad",
                "cook_time": 10,
                "prep_time": 10,
                "total_time": 20,
                "main_ingredient": "Chicken",
            },
            "ingredients": [
                {
                    "name": "Lettuce",
                    "quantity": 1,
                    "unit": "bunch",
                    "display_name": "Romaine Lettuce",
                }
            ],
            "steps": [{"step": 1, "description": "Step"}]
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
         # Check that the recipe was created
        recipe = Recipe.objects.get(name="Salad")
        self.assertEqual(recipe.cook_time, 10)
        self.assertEqual(recipe.prep_time, 10)
        self.assertEqual(recipe.total_time, 20)
        self.assertEqual(recipe.main_ingredient.lower(), "chicken")
        self.assertEqual(recipe.steps, [{"step": 1, "description": "Step"}])
        self.assertFalse(recipe.needs_review)
        self.assertEqual(recipe.user, self.user)

        
        ingredient = Ingredient.objects.get(name="Lettuce")
        self.assertEqual(ingredient.aisle.name, "Uncategorized")
        self.assertFalse(ingredient.needs_review)
        self.assertEqual(ingredient.aisle.user, self.user)

        # Check that the recipe ingredient was created and linked properly
        recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingredient)
        self.assertEqual(recipe_ingredient.quantity, "1")
        # self.assertEqual(recipe_ingredient.unit, "bunch")
        self.assertFalse(recipe_ingredient.needs_review)
        
    def test_post_new_recipe_missing_steps(self):
        payload = {
            "recipe": {
                "name": "Salad",
                "cook_time": 10,
                "prep_time": 10,
                "total_time": 20,
                "main_ingredient": "Chicken",
            },
            "ingredients": [
                {
                    "name": "Lettuce",
                    "quantity": 1,
                    "unit": "bunch",
                    "display_name": "Romaine Lettuce",
                }
            ],
            "steps": None
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that the recipe was created
        recipe = Recipe.objects.get(name="Salad")
        self.assertEqual(recipe.cook_time, 10)
        self.assertEqual(recipe.prep_time, 10)
        self.assertEqual(recipe.total_time, 20)
        self.assertEqual(recipe.main_ingredient.lower(), "chicken")
        self.assertEqual(recipe.steps, None)
        self.assertTrue(recipe.needs_review) # The recipe is saved but the flag is set
        self.assertEqual(recipe.user, self.user)

        
        ingredient = Ingredient.objects.get(name="Lettuce")
        self.assertEqual(ingredient.aisle.name, "Uncategorized")
        self.assertFalse(ingredient.needs_review)
        self.assertEqual(ingredient.aisle.user, self.user)

        # Check that the recipe ingredient was created and linked properly
        recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingredient)
        self.assertEqual(recipe_ingredient.quantity, "1")
        # self.assertEqual(recipe_ingredient.unit, "bunch")
        self.assertFalse(recipe_ingredient.needs_review)
        
    def test_post_new_recipe_missing_prep(self):
        payload = {
            "recipe": {
                "name": "Salad",
                "cook_time": 10,
                "prep_time": None,
                "total_time": 20,
                "main_ingredient": "Chicken",
            },
            "ingredients": [
                {
                    "name": "Lettuce",
                    "quantity": 1,
                    "unit": "bunch",
                    "display_name": "Romaine Lettuce",
                }
            ],
             "steps": [{"step": 1, "description": "Step"}]
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that the recipe was created
        recipe = Recipe.objects.get(name="Salad")
        self.assertEqual(recipe.cook_time, 10)
        self.assertEqual(recipe.prep_time, None)
        self.assertEqual(recipe.total_time, 20)
        self.assertEqual(recipe.main_ingredient.lower(), "chicken")
        self.assertEqual(recipe.steps, [{"step": 1, "description": "Step"}])
        self.assertTrue(recipe.needs_review) # The recipe is saved but the flag is set
        self.assertEqual(recipe.user, self.user)

        
        ingredient = Ingredient.objects.get(name="Lettuce")
        self.assertEqual(ingredient.aisle.name, "Uncategorized")
        self.assertFalse(ingredient.needs_review)
        self.assertEqual(ingredient.aisle.user, self.user)

        # Check that the recipe ingredient was created and linked properly
        recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingredient)
        self.assertEqual(recipe_ingredient.quantity, "1")
        # self.assertEqual(recipe_ingredient.unit, "bunch")
        self.assertFalse(recipe_ingredient.needs_review)
    
    def test_post_new_ingredient_missing_name(self):
        payload = {
            "recipe": {
                "name": "Salad",
                "cook_time": 10,
                "prep_time": 10,
                "total_time": 20,
                "main_ingredient": "Chicken",
            },
            "ingredients": [
                {
                    "name": None,
                    "quantity": 1,
                    "unit": "bunch",
                    "display_name": "Romaine Lettuce",
                }
            ],
             "steps": [{"step": 1, "description": "Step"}]
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
         # Check that the recipe was created
        recipe = Recipe.objects.get(name="Salad")
        self.assertEqual(recipe.cook_time, 10)
        self.assertEqual(recipe.prep_time, 10)
        self.assertEqual(recipe.total_time, 20)
        self.assertEqual(recipe.main_ingredient.lower(), "chicken")
        self.assertEqual(recipe.steps, [{"step": 1, "description": "Step"}])
        self.assertFalse(recipe.needs_review)
        self.assertEqual(recipe.user, self.user)

        
        ingredient = Ingredient.objects.get(name=None)
        self.assertEqual(ingredient.aisle.name, "Uncategorized")
        self.assertTrue(ingredient.needs_review)
        self.assertEqual(ingredient.aisle.user, self.user)

        # Check that the recipe ingredient was created and linked properly
        recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingredient)
        self.assertEqual(recipe_ingredient.quantity, "1")
        # self.assertEqual(recipe_ingredient.unit, "bunch")
        self.assertFalse(recipe_ingredient.needs_review)
     
    def test_post_new_ingredient_missing_aisle(self):
        payload = {
            "recipe": {
                "name": "Salad",
                "cook_time": 10,
                "prep_time": 10,
                "total_time": 20,
                "main_ingredient": "Chicken",
            },
            "ingredients": [
                {
                    "name": "no aisle",
                    "quantity": 1,
                    "unit": "bunch",
                    "display_name": "Romaine Lettuce",
                }
            ],
            "steps": [{"step": 1, "description": "Step"}]
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
         # Check that the recipe was created
        recipe = Recipe.objects.get(name="Salad")
        self.assertEqual(recipe.cook_time, 10)
        self.assertEqual(recipe.prep_time, 10)
        self.assertEqual(recipe.total_time, 20)
        self.assertEqual(recipe.main_ingredient.lower(), "chicken")
        self.assertEqual(recipe.steps, [{"step": 1, "description": "Step"}])
        self.assertFalse(recipe.needs_review)
        self.assertEqual(recipe.user, self.user)

        
        ingredient = Ingredient.objects.get(name="no aisle")
        self.assertEqual(ingredient.aisle.name, "Uncategorized")
        self.assertFalse(ingredient.needs_review)
        self.assertEqual(ingredient.aisle.user, self.user)

        # Check that the recipe ingredient was created and linked properly
        recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingredient)
        self.assertEqual(recipe_ingredient.quantity, "1")
        # self.assertEqual(recipe_ingredient.unit, "bunch")
        self.assertFalse(recipe_ingredient.needs_review)

