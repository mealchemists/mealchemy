import random
import uuid
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

from backend.apps.recipes.models.ingredients import Aisle, Ingredient, RecipeIngredient
from backend.apps.recipes.models.recipe import Recipe
from backend.apps.recipes.models.units import Unit
# from backend.data_generator import create_ingredients

class RecipeIngredientsAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.login(username="testuser", password="testpass")

        self.aisle = Aisle.objects.create(name="Produce", user=self.user)
        self.ingredient =  Ingredient.objects.create(
            name="TEST-OBJECT-" + str(uuid.uuid4()),
            calories_per_100g=random.uniform(50, 500),
            protein_per_100g=random.uniform(1, 30),
            carbs_per_100g=random.uniform(1, 50),
            sugar_per_100g=random.uniform(0, 30),
            fat_per_100g=random.uniform(0, 20),
            sodium_per_100mg=random.uniform(0,1500),
            fiber_per_100g=random.uniform(0, 15),

        )
        self.recipe = Recipe.objects.create(user=self.user, name="Tomato Soup")
        self.recipe_ingredient = RecipeIngredient.objects.create(
            recipe=self.recipe,
            ingredient=self.ingredient,
            quantity=2,
            unit="cups",
            display_name="Chopped Tomatoes"
        )

    def test_get_all_recipe_ingredients(self):
        url = reverse("recipe-ingredients")  # Adjust this to match your URL conf
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("ingredients", response.data[0])

    def test_FR19_post_new_recipe_with_ingredients(self):
        url = reverse("recipe-ingredients")
        payload = {
            "recipe": {
                "name": "Salad",
                "cook_time": 10,
                "prep_time": 10,
                "total_time": 20,
                "main_ingredient": "Chicken",
                "steps": [{"step": 1, "description": "Step"}]
            },
            "ingredients": [
                {
                    "name": "Lettuce",
                    "quantity": 1,
                    "unit": "bunch",
                    "display_name": "Romaine Lettuce",
                    "aisle": "Produce"
                }
            ]
        }
        response = self.client.post(url, payload, format="json")
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
        self.assertEqual(ingredient.aisle.name, "Produce")
        self.assertFalse(ingredient.needs_review)
        self.assertEqual(ingredient.aisle.user, self.user)

        # Check that the recipe ingredient was created and linked properly
        recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingredient)
        self.assertEqual(recipe_ingredient.quantity, "1")
        self.assertEqual(recipe_ingredient.unit, "bunch")
        self.assertFalse(recipe_ingredient.needs_review)
        self.assertEqual(recipe_ingredient.display_name, "Romaine Lettuce")
        
    def test_FR18_FR11_post_new_recipe_missing_steps(self):
        url = reverse("recipe-ingredients")
        payload = {
            "recipe": {
                "name": "Salad",
                "cook_time": 10,
                "prep_time": 10,
                "total_time": 20,
                "main_ingredient": "Chicken",
                "steps": None
            },
            "ingredients": [
                {
                    "name": "Lettuce",
                    "quantity": 1,
                    "unit": "bunch",
                    "display_name": "Romaine Lettuce",
                    "aisle": "Produce"
                }
            ]
        }
        response = self.client.post(url, payload, format="json")
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
        self.assertEqual(ingredient.aisle.name, "Produce")
        self.assertFalse(ingredient.needs_review)
        self.assertEqual(ingredient.aisle.user, self.user)

        # Check that the recipe ingredient was created and linked properly
        recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingredient)
        self.assertEqual(recipe_ingredient.quantity, "1")
        self.assertEqual(recipe_ingredient.unit, "bunch")
        self.assertFalse(recipe_ingredient.needs_review)
        self.assertEqual(recipe_ingredient.display_name, "Romaine Lettuce")
        
    def test_FR18_FR11_post_new_recipe_missing_prep(self):
        url = reverse("recipe-ingredients")
        payload = {
            "recipe": {
                "name": "Salad",
                "cook_time": 10,
                "prep_time": None,
                "total_time": 20,
                "main_ingredient": "Chicken",
                "steps": [{"step": 1, "description": "Step"}]
            },
            "ingredients": [
                {
                    "name": "Lettuce",
                    "quantity": 1,
                    "unit": "bunch",
                    "display_name": "Romaine Lettuce",
                    "aisle": "Produce"
                }
            ]
        }
        response = self.client.post(url, payload, format="json")
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
        self.assertEqual(ingredient.aisle.name, "Produce")
        self.assertFalse(ingredient.needs_review)
        self.assertEqual(ingredient.aisle.user, self.user)

        # Check that the recipe ingredient was created and linked properly
        recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingredient)
        self.assertEqual(recipe_ingredient.quantity, "1")
        self.assertEqual(recipe_ingredient.unit, "bunch")
        self.assertFalse(recipe_ingredient.needs_review)
        self.assertEqual(recipe_ingredient.display_name, "Romaine Lettuce")
    
    def test_FR18_FR11_post_new_ingredient_missing_name(self):
        url = reverse("recipe-ingredients")
        payload = {
            "recipe": {
                "name": "Salad",
                "cook_time": 10,
                "prep_time": 10,
                "total_time": 20,
                "main_ingredient": "Chicken",
                "steps": [{"step": 1, "description": "Step"}]
            },
            "ingredients": [
                {
                    "name": None,
                    "quantity": 1,
                    "unit": "bunch",
                    "display_name": "Romaine Lettuce",
                    "aisle": "Produce"
                }
            ]
        }
        response = self.client.post(url, payload, format="json")
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
        self.assertEqual(ingredient.aisle.name, "Produce")
        self.assertTrue(ingredient.needs_review)
        self.assertEqual(ingredient.aisle.user, self.user)

        # Check that the recipe ingredient was created and linked properly
        recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingredient)
        self.assertEqual(recipe_ingredient.quantity, "1")
        self.assertEqual(recipe_ingredient.unit, "bunch")
        self.assertFalse(recipe_ingredient.needs_review)
        self.assertEqual(recipe_ingredient.display_name, "Romaine Lettuce")
     
    def test_post_new_ingredient_missing_aisle(self):
        url = reverse("recipe-ingredients")
        payload = {
            "recipe": {
                "name": "Salad",
                "cook_time": 10,
                "prep_time": 10,
                "total_time": 20,
                "main_ingredient": "Chicken",
                "steps": [{"step": 1, "description": "Step"}]
            },
            "ingredients": [
                {
                    "name": "no aisle",
                    "quantity": 1,
                    "unit": "bunch",
                    "display_name": "Romaine Lettuce",
                    "aisle": None
                }
            ]
        }
        response = self.client.post(url, payload, format="json")
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
        self.assertEqual(recipe_ingredient.unit, "bunch")
        self.assertFalse(recipe_ingredient.needs_review)
        self.assertEqual(recipe_ingredient.display_name, "Romaine Lettuce")
    
    def test_FR21_put_recipe_object(self):
        url = reverse("recipe-ingredients")
        initial_payload = {
            "recipe": {
                "name": "Salad",
                "cook_time": 10,
                "prep_time": 10,
                "total_time": 20,
                "main_ingredient": "Chicken",
                "steps": [{"step": 1, "description": "Step"}],
            },
            "ingredients": [
                {
                    "name": "no aisle",
                    "quantity": 1,
                    "unit": "bunch",
                    "display_name": "Romaine Lettuce",
                    "aisle": None,
                }
            ],
        }

        response = self.client.post(url, initial_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        recipe = Recipe.objects.get(name="Salad")
        put_url = reverse("recipe-ingredients")  

        updated_payload = {
            "recipe": {
                "id": recipe.id,
                "name": "New Name", 
                "cook_time": 15,
                "prep_time": 5,
                "total_time": 25,
                "main_ingredient": "Tofu",
                "steps": [{"step": 1, "description": "Updated Step"}],
            },
            "ingredients": [
                {
                    "name": "no aisle",
                    "quantity": 2,
                    "unit": Unit.GRAM.label,
                    "display_name": "Butter Lettuce",
                    "aisle": None,
                }
            ],
        }

        response = self.client.put(put_url, updated_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Refresh from DB
        recipe.refresh_from_db()
        ingredient = Ingredient.objects.get(name="no aisle")
        recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingredient)

        # Updated assertions
        self.assertEqual(recipe.name, "New Name")
        self.assertEqual(recipe.cook_time, 15)
        self.assertEqual(recipe.prep_time, 5)
        self.assertEqual(recipe.total_time, 25)
        self.assertEqual(recipe.main_ingredient.lower(), "tofu")
        self.assertEqual(recipe.steps, [{"step": 1, "description": "Updated Step"}])

        self.assertEqual(recipe_ingredient.quantity, "2")
        self.assertEqual(recipe_ingredient.unit, Unit.GRAM.label)
        self.assertEqual(recipe_ingredient.display_name, "Butter Lettuce")
