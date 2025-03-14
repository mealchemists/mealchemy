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

        