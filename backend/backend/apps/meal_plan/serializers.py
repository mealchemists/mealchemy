from rest_framework import serializers

from backend.apps.recipes.serializers import RecipeSerializer
from backend.apps.recipes.models.recipe import Recipe

from .models.meal_plan import MealPlan


class MealPlanSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer()
    
    class Meta:
        model = MealPlan
        fields = '__all__'
        
    def create(self, validated_data):
        recipe_data = validated_data.pop('recipe')
        
        recipe = Recipe.objects.get(id=recipe_data['id'])
        
        meal_plan = MealPlan.objects.create(recipe=recipe, **validated_data)
        
        return meal_plan
    