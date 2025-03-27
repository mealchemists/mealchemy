from rest_framework import serializers

from backend.apps.recipes.serializers import RecipeSerializer
from backend.apps.recipes.models.recipe import Recipe

from .models.meal_plan import MealPlan


class MealPlanSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer()
    day_planned = serializers.DateField(format='%Y-%m-%d')
    
    class Meta:
        model = MealPlan
        fields = ['id', 'recipe', 'day_planned']
    
    def update(self, instance, validated_data):
        recipe = Recipe.objects.get(id=self.initial_data["recipe"]["id"])
        instance.recipe = recipe
        instance.save()
        print(instance)
        
        return instance
        
    def create(self, validated_data):
        recipe_data = validated_data.pop('recipe')
        recipe = Recipe.objects.get(id=self.initial_data["recipe"]["id"])
        
        meal_plan = MealPlan.objects.create(
            day_planned = validated_data.get("day_planned"),
            recipe = recipe
        )
        
        return meal_plan
    
