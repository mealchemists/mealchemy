from rest_framework import serializers

from .models.ingredients import Ingredient, RecipeIngredient
from .models.recipe import Recipe


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = '__all__'
        read_only_fields = ['user']
     
        
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'
        
class RecipeIngredientSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer()
    # ingredient = IngredientSerializer(many=True)
    
    class Meta:
        model = RecipeIngredient
        fields = '__all__'
    

