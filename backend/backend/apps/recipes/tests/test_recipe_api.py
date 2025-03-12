from rest_framework import status

from backend.apps.recipes.models.recipe import Recipe
from backend.apps.test_utils.test_base_api import BaseApiTest


class RecipeApiTest(BaseApiTest):

    def test_get_list(self):
        response = self.client.get(self.recipe_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Assuming one recipe exists

    def test_get_detail(self):
        response = self.client.get(self.recipe_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.recipe_model.name)

    def test_create_object(self):
        response = self.client.post(self.recipe_list_url, self.recipe_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Recipe.objects.count(), 2)  # Check that a new object was created

    def test_update_object(self):
        data = self.recipe_data
        data["name"] = 'Updated Object'
        response = self.client.put(self.recipe_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.recipe_model.refresh_from_db()
        self.assertEqual(self.recipe_model.name, 'Updated Object')

    def test_delete_object(self):
        response = self.client.delete(self.recipe_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Recipe.objects.count(), 0)  # Verify the object was deleted
