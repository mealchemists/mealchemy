from django.urls import reverse
from rest_framework import status

from backend.apps.recipes.models.ingredients import Ingredient
from backend.apps.test_utils.test_base_api import BaseApiTest
from backend.data_generator import create_ingredients


class RecipeIngredientApiTest(BaseApiTest):
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
