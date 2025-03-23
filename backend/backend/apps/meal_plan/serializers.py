from rest_framework import serializers

from backend.apps.recipes.serializers import RecipeSerializer

from .models.meal_plan import MealPlan


class MealPlanSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer()
    
    class Meta:
        model = MealPlan
        fields = '__all__'