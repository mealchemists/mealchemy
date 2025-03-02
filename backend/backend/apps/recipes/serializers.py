from rest_framework import serializers
from .models.recipe import Recipe
from .models.ingredients import Ingredient, RecipeIngredient

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = '__all__'
        
    def create(self, validated_data):
        """
        Create a recipe and its ingredients in a single request.
        """
        ingredients_data = validated_data.pop("ingredients")
        recipe = Recipe.objects.create(**validated_data)

        # Create RecipeIngredient instances
        for ingredient_data in ingredients_data:
            ingredient_data["recipe"] = recipe
            self.fields["ingredients"].create(ingredient_data)

        return recipe
        
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
        
    
        

    

