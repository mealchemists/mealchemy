
from datetime import datetime
import random
import uuid
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from backend.apps.meal_plan.models.meal_plan import MealPlan
from backend.apps.recipes.models.recipe import Recipe  
from backend.apps.recipes.models.ingredients import RecipeIngredient, Ingredient, Aisle
from backend.apps.meal_plan.serializers import MealPlanSerializer  
from django.contrib.auth.models import User


class MealPlanApiTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.login(username="testuser", password="testpass")

        self.aisle = Aisle.objects.create(name="Produce", user=self.user)
        self.ingredient = Ingredient.objects.create(
            name="TEST-OBJECT-" + str(uuid.uuid4()),
            calories_per_100g=random.uniform(50, 500),
            protein_per_100g=random.uniform(1, 30),
            carbs_per_100g=random.uniform(1, 50),
            sugar_per_100g=random.uniform(0, 30),
            fat_per_100g=random.uniform(0, 20),
            sodium_per_100mg=random.uniform(0, 1500),
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
        
        # Create an initial meal plan for testing
        self.meal_plan_model = MealPlan.objects.create(
            day_planned=datetime.now(),
            meal_type='Breakfast',
            recipe=self.recipe
        )

        # Data for creating a new meal plan
        self.meal_plan_data = [{
            "day_planned": "2025-04-06T14:30:00.123456Z",
            "meal_type": "Breakfast",
            "recipe":  {
                "name": "Tomato Soup",
                "cook_time": None,
                "prep_time": None,
                "total_time": None,
                "main_ingredient": None,
                "steps": []
            }
        }]
        
        # Define URL for the meal plan list and detail view
        self.url = reverse('meal_plan')  # URL for the meal plan list view
        self.meal_plan_detail_url = reverse('meal_plan', args=[self.meal_plan_model.id])  # URL for the meal plan detail view

    def test_get_list(self):
        """
        Test to ensure that the list of meal plans can be retrieved.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Assuming one meal plan exists

    def test_get_detail(self):
        # Make sure the MealPlan and Recipe objects are created properly
        recipe = Recipe.objects.create(name="Recipe Name")
        meal_plan = MealPlan.objects.create(day_planned="2025-04-06", recipe=recipe)

        # Now, when you make the GET request, the response should include the 'recipe' field
        response = self.client.get(f'/api/meal_plan/{meal_plan.id}/')  # Adjust URL as needed
        
        # Check that the 'recipe' is in the response data
        self.assertIn('recipe', response.data)  # Make sure the 'recipe' key is present
        self.assertEqual(response.data['recipe']['id'], recipe.id)  # Verify the 'id' of the nested 'recipe'
        self.assertEqual(response.data['recipe']['name'], recipe.name)  # Verify the 'name' of the nested 'recipe'

    def test_create_object(self):
        """
        Test to ensure that a new meal plan can be created.
        """
        response = self.client.post(self.url, self.meal_plan_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)  # Expect 201 Created for successful creation
        self.assertEqual(MealPlan.objects.count(), 2)  # Verify a new meal plan is created

    def test_delete_object(self):
        """
        Test to ensure that a meal plan can be deleted.
        """
        response = self.client.delete(self.meal_plan_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(MealPlan.objects.count(), 0)  # Verify the meal plan is deleted

    def test_invalid_delete(self):
        """
        Test to handle deleting a non-existing meal plan.
        """
        url = reverse('meal_plan', args=[999999])  # Non-existent ID
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)  # Expect 404 Not Found

