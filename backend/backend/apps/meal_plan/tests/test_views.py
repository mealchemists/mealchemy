
from datetime import datetime

from django.urls import reverse
from rest_framework import status

from backend.apps.meal_plan.models.meal_plan import MealPlan
from backend.apps.test_utils.test_base_api import BaseApiTest


class MealPlanApiTest(BaseApiTest):
    def setUp(self):
        super().setUp()  # Call the setup from BaseApiTest
       
        self.meal_plan_model = MealPlan.objects.create(
           day_planned=datetime.now(),
           meal_type='Breakfast',
           recipe = self.recipe_model
        )
        
        self.meal_plan_data = {
            "day_planned": "IDK",
            "meal_type": "Breakfast",
            "recipe": "1"
        }
        
         # Define the URLs for list and detail views
        self.meal_plan_list_url = reverse('meal-plan-list')  # Replace with your actual URL name for the list view
        self.meal_plan_detail_url = reverse('meal-plan-detail', args=[self.meal_plan_model.id])  # Replace with your actual URL name for the detail view


       
    def test_get_list(self):
        response = self.client.get(self.meal_plan_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Assuming one recipe exists

    def test_get_detail(self):
        response = self.client.get(self.meal_plan_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.response_matches_data(response.data, self.meal_plan_data))

    def test_create_object(self):
        response = self.client.post(self.meal_plan_list_url, self.meal_plan_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MealPlan.objects.count(), 2)  # Check that a new object was created

    # def test_update_object(self):
    #     data = self.recipe_data
    #     data["name"] = 'Updated Object'
    #     response = self.client.put(self.meal_plan_detail_url, data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
    #     self.meal_plan_model.refresh_from_db()
    #     self.assertEqual(self.meal_plan_model.name, 'Updated Object')

    def test_delete_object(self):
        response = self.client.delete(self.meal_plan_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(MealPlan.objects.count(), 0)  # Verify the object was deleted