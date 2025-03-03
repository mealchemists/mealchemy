from rest_framework import serializers
from .models.meal_plan import MealPlan
from backend.apps.recipes.serializers import RecipeSerializer

class MealPlanSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer()
    
    class Meta:
        model = MealPlan
        fields = '__all__'