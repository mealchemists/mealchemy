import random
import uuid
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

from backend.apps.recipes.models.ingredients import Aisle, Ingredient, RecipeIngredient
from backend.apps.recipes.models.recipe import Recipe
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

    def test_post_new_recipe_with_ingredients(self):
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
        
    def test_post_new_recipe_missing_steps(self):
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
        
    def test_post_new_recipe_missing_prep(self):
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
    
    def test_post_new_ingredient_missing_name(self):
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

        
        ingredient = Ingredient.objects.get(name="Lettuce")
        self.assertEqual(ingredient.aisle.name, "Produce")
        self.assertTrue(ingredient.needs_review)
        self.assertEqual(ingredient.aisle.user, self.user)

        # Check that the recipe ingredient was created and linked properly
        recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingredient)
        self.assertEqual(recipe_ingredient.quantity, "1")
        self.assertEqual(recipe_ingredient.unit, "bunch")
        self.assertFalse(recipe_ingredient.needs_review)
        self.assertEqual(recipe_ingredient.display_name, "Romaine Lettuce")
     
    def test_delete_recipe_ingredient(self):
        url = reverse("recipe-ingredients", kwargs={"pk": self.recipe_ingredient.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(RecipeIngredient.objects.filter(pk=self.recipe_ingredient.pk).exists())

    def test_update_recipe_with_ingredients(self):
        url = reverse("recipe-ingredients")
        payload = {
            "recipe": {
                "id": self.recipe.id,
                "name": "Tomato Soup 2.0",
                "cook_time": 15,
            },
            "ingredients": [
                {
                    "name": "Tomato",
                    "quantity": 3,
                    "unit": "cups",
                    "display_name": "Fresh Tomato",
                    "aisle": "Produce"
                }
            ]
        }
        response = self.client.put(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()
        self.assertEqual(self.recipe.name, "Tomato Soup 2.0")
        
# class RecipeIngredientApiTest(APITestCase):
#     def setUp(self):
#         # Create and log in user
#         self.user = User.objects.create_user(username='testuser', password='password')
#         self.client.login(username='testuser', password='password')

#         # Create Recipe
#         self.recipe = Recipe.objects.create(
#             user=self.user,
#             name="Test Object",
#             prep_time=10,
#             cook_time=10,
#             total_time=20,
#             source_url="https://example.com"
#         )

#         self.recipe_data = {
#             'name': 'New Object',
#             'prep_time': 15,
#             'cook_time': 15,
#             'total_time': 30,
#             'source_url': 'https://www.allrecipes.com/recipe/21014/good-old-fashioned-pancakes/'
#         }

#         self.ingredients = create_ingredients()  # Generates default 20 ingredients

#         self.ingredient_data = {
#             "name": "Test New Ingredient",
#             "calories_per_100g": 200.0,
#             "protein_per_100g": 15.0,
#             "carbs_per_100g": 30.0,
#             "sugar_per_100g": 10.0,
#             "fat_per_100g": 5.0,
#             "sodium_per_100mg": 500.0,
#             "fiber_per_100g": 3.0,
#         }

#         self.ingredient_list_url = reverse('ingredient-list')
#         self.ingredient_detail_url = reverse('ingredient-detail', args=[self.ingredients[0].id])

#     def tearDown(self):
#         Ingredient.objects.all().delete()
#         Recipe.objects.all().delete()
#         User.objects.all().delete()
#         RecipeIngredient.objects.all().delete()

#     def test_list_ingredients(self):
#         response = self.client.get(self.ingredient_list_url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(len(response.data), len(self.ingredients))

#     def test_get_ingredient_detail(self):
#         response = self.client.get(self.ingredient_detail_url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data['name'], self.ingredients[0].name)

#     def test_create_ingredient(self):
#         response = self.client.post(self.ingredient_list_url, self.ingredient_data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Ingredient.objects.count(), len(self.ingredients) + 1)

#     def test_update_ingredient(self):
#         updated_data = {**self.ingredient_data, 'name': 'Updated Ingredient'}

#         response = self.client.put(self.ingredient_detail_url, updated_data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)

#         self.ingredients[0].refresh_from_db()
#         self.assertEqual(self.ingredients[0].name, 'Updated Ingredient')

#     def test_delete_ingredient(self):
#         response = self.client.delete(self.ingredient_detail_url)
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
#         self.assertFalse(Ingredient.objects.filter(id=self.ingredients[0].id).exists())
