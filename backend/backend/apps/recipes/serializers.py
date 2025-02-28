from rest_framework import serializers
from .models.recipe import Recipe
from .models.ingredients import Ingredient, RecipeIngredient

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
    # ingredient = IngredientSerializer(many=True)

    class Meta:
        model = RecipeIngredient
        fields = '__all__'
    

