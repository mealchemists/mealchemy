from django.urls import reverse
from rest_framework import status

from backend.apps.recipes.models.ingredients import Ingredient
from backend.apps.recipes.tests.test_base_api import BaseApiTest
# from backend.data_generator import create_ingredients
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import login, authenticate, logout

from backend.apps.recipes.models.recipe import Recipe


class BaseApiTest(APITestCase):
    """
    This a base testcase that creates inital database objects that are likely 
    to be shared in many Api test cases
    """
    def setUp(self):
        # Create a user
        username = 'testuser'
        password = 'password'
        self.user = User.objects.create_user(username=username, password=password)
        
        # Log in the client with the user
        self.client.login(username='testuser', password='password')

        # Create a Recipe instance
        self.recipe_model = Recipe.objects.create(
            user=self.user,  # Link the Recipe to the created user
            name="Test Object", 
            prep_time=10, 
            cook_time=10, 
            total_time=20,
            source_url="www.allrecipes.com"
        )
        
        self.recipe_data = {
            'name': 'New Object', 
            'prep_time': 15, 
            'cook_time': 15, 
            'total_time': 30, 
            'source_url': 'https://www.allrecipes.com/recipe/21014/good-old-fashioned-pancakes/'
        }

        # Define the URLs for list and detail views
        self.recipe_list_url = reverse('recipe-list')  # Replace with your actual URL name for the list view
        self.recipe_detail_url = reverse('recipe-detail', args=[self.recipe_model.id])  # Replace with your actual URL name for the detail view

    def response_matches_data(self, response, data):
        """
        Checks if all key-value pairs in the response dictionary exist in the data dictionary.
        Order does not matter.

        :param response: A dictionary representing the response.
        :param data: A dictionary containing expected key-value pairs.
        :return: True if response matches data, otherwise False.
        """
        return all(response.get(key) == value for key, value in data.items())

        

class IngredientApiTest(BaseApiTest):
    def setUp(self):
        super().setUp()
        self.ingredients = create_ingredients()  # Default n=20
        
        # Sample data for creation and updates
        self.ingredient_data = [{
            "name": "Test New Ingredient",
            "calories_per_100g": 200.0,
            "protein_per_100g": 15.0,
            "carbs_per_100g": 30.0,
            "sugar_per_100g": 10.0,
            "fat_per_100g": 5.0,
            "sodium_per_100mg": 500.0,
            "fiber_per_100g": 3.0,
        }]
        
        # Define the URLs for list and detail views
        self.ingredient_list_url = reverse('ingredient-list')  
        self.ingredient_detail_url = reverse('ingredient-detail', args=[self.ingredients[0].id])  

    def tearDown(self):
        for ingredient in self.ingredients:
            ingredient.delete()
        super().tearDown()

    def test_get_list(self):
        response = self.client.get(self.ingredient_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), len(self.ingredients))  # Match the created count

    def test_get_detail(self):
        response = self.client.get(self.ingredient_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.ingredients[0].name)

    def test_create_object(self):
        response = self.client.post(self.ingredient_list_url, self.ingredient_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ingredient.objects.count(), len(self.ingredients) + 1)  # Ensure a new object was added

    def test_update_object(self):
        updated_data = self.ingredient_data[0]
        updated_data["name"] = 'Updated Object'
        
        response = self.client.put(self.ingredient_detail_url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED) 
        self.ingredients[0].refresh_from_db()
        self.assertEqual(self.ingredients[0].name, 'Updated Object')

    def test_delete_object(self):
        response = self.client.delete(self.ingredient_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Ingredient.objects.filter(id=self.ingredients[0].id).exists())  # Verify deletion
