from rest_framework import serializers

from .models.ingredients import Ingredient, RecipeIngredient, Aisle
from .models.recipe import Recipe, Step


class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = '__all__'

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = '__all__'
     
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'
        
class RecipeIngredientSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer()
    
    class Meta:
        model = RecipeIngredient
        fields = '__all__'
        

class AisleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aisle
        fields = '__all__'