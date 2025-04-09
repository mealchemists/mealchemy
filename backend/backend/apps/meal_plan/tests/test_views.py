
from datetime import date, datetime, timedelta
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
            nutrients = {}
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
                "id": self.recipe.id,
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
        recipe = Recipe.objects.create(user=self.user, name="Recipe Name")
        meal_plan = MealPlan.objects.create(day_planned=date.today(), recipe=recipe)

        # Now, when you make the GET request, the response should include the 'recipe' field
        response = self.client.get( self.url) 
        
        # Check that the 'recipe' is in the response data
        self.assertEqual(len(response.data['meal_plan']), 2)
        for meal_plan in response.data['meal_plan']:
            self.assertIn('recipe', meal_plan)  # Make sure the 'recipe' key is present
            self.assertIn(meal_plan['recipe']['id'], [recipe.id, self.recipe.id])  
            self.assertIn(meal_plan['recipe']['name'], [recipe.name, self.recipe.name])
            
    def test_get_detail_with_date_range(self):
        today = date.today()
        next_week = today + timedelta(days=7)
        next_week_2_day = today + timedelta(days=9)
        

        # Recipes and meal plans
        recipe1 = Recipe.objects.create(user=self.user, name="Recipe One")
        recipe2 = Recipe.objects.create(user=self.user, name="Recipe Two")

        meal_plan1 = MealPlan.objects.create(day_planned=next_week_2_day, recipe=recipe1)
        meal_plan2 = MealPlan.objects.create(day_planned=next_week, recipe=recipe2)

        # GET request with date range filter that only includes today
        response = self.client.get(
            self.url,
            {'start_date': str(next_week - timedelta(days=1)), 'end_date': str(next_week_2_day)}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['meal_plan']), 2)

        for meal_plan_data in response.data['meal_plan']:
            self.assertIn('recipe', meal_plan_data)
            self.assertIn(meal_plan_data['recipe']['id'], [recipe1.id, recipe2.id])
            self.assertIn(meal_plan_data['recipe']['name'], [recipe1.name, recipe2.name])

    def test_create_object(self):
        """
        Test to ensure that a new meal plan can be created.
        """
        response = self.client.post(self.url, self.meal_plan_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # Expect 201 Created for successful creation
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

