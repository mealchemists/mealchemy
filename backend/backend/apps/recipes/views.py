from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, mixins, status, viewsets
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
import random
from ..meal_plan.models.meal_plan import MealPlan
from .models.ingredients import Ingredient, RecipeIngredient
from .models.recipe import Recipe
from .producer import publish
from .serializers import (IngredientSerializer, RecipeIngredientSerializer,
                          RecipeSerializer)


@api_view(['POST'])
def save_scraped_data(request):
    if request.method == 'POST':
        ingredients = request.data["ingredients"]
        
        recipe_serialzer = RecipeSerializer(data=request.data["recipe"])
        recipe_serialzer.is_valid(raise_exception=True)
        recipe = recipe_serialzer.save()
        
        for ingredient_data in ingredients:
            ingredient_serializer = IngredientSerializer(data={"name": ingredient_data['name']})
            if ingredient_serializer.is_valid():
                ingredient = ingredient_serializer.save()
                RecipeIngredient.objects.create(recipe=recipe, ingredient=ingredient, quantity=ingredient_data['quantity'], unit=ingredient_data['unit'])            
 
        return Response({
            'cart': recipe_serialzer.data,
            'another': ingredient_serializer.data
        })
    
@api_view(['POST'])
def recipe_url(request):
    if request.method == 'POST':
        data = request.data
        print(data['url'])
        publish(data['url'])
        return Response(data, status=status.HTTP_201_CREATED)
        
class RecipeIngredientsAPIView(APIView):
    def get_queryset(self):
        return RecipeIngredient.objects.filter(recipe__user=self.request.user).prefetch_related("recipe", "ingredient")
    
    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        if not self.kwargs:
            # If no ID is provided, return all recipes grouped with their ingredients
            recipes = {}
            for ri in queryset:
                recipe_id = ri.recipe.id
                if recipe_id not in recipes:
                    recipes[recipe_id] = {
                        "id": recipe_id,
                        "recipe": RecipeSerializer(ri.recipe).data,
                        "ingredients": []
                    }
                
                recipes[recipe_id]["ingredients"].append({
                    "quantity": ri.quantity,
                    "unit": ri.unit,
                    "display_name": ri.display_name,
                    "name": ri.ingredient.name 
                })

            return Response(list(recipes.values()), status=status.HTTP_200_OK)

        # If an ID is provided, filter by recipe ID
        recipe_id = self.kwargs["pk"]
        recipe_ingredients = queryset.filter(recipe_id=recipe_id)

        if not recipe_ingredients.exists():
            return Response({"error": "No ingredients found for this recipe."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize recipe info
        recipe_data = RecipeSerializer(recipe_ingredients.first().recipe).data
        ingredient_data = IngredientSerializer()
        
        # Aggregate all ingredients into a list
        ingredients_data = [
            {
                "quantity": ri.quantity,
                "unit": ri.unit,
                "display_name": ri.display_name,
                "name": ri.ingredient.name  # Assuming Ingredient has a `name` field
            }
            for ri in recipe_ingredients
        ]

        return Response(
            {
                "id": recipe_id,
                "recipe": recipe_data,
                "ingredients": ingredients_data
            },
            status=status.HTTP_200_OK
        )
        
    def post(self, request, *args, **kwargs):
        # serialize entire recipe object
        serializer = RecipeSerializer(data=request.data['recipe'])

        if serializer.is_valid():
            ingredients_data = request.data.pop('ingredients', [])  # Extract ingredients
            recipe = Recipe.objects.create(**serializer.validated_data)  # Create Recipe

            for ingredient_data in ingredients_data:
                ingredient_name = ingredient_data.get('name')
                quantity = ingredient_data.get('quantity')
                unit = ingredient_data.get('unit')
                display_name = ingredient_data.get('display_name')

                if not display_name:
                    display_name = ingredient_name 
                if not ingredient_name or not quantity or not unit:
                    return Response({"error": "Missing ingredient data"}, status=status.HTTP_400_BAD_REQUEST)

                # TODO handle nutrition information
                # TODO handle Aisle
                calories_per_100g=random.uniform(50, 500),
                protein_per_100g=random.uniform(1, 30),
                carbs_per_100g=random.uniform(1, 50),
                sugar_per_100g=random.uniform(0, 30),
                fat_per_100g=random.uniform(0, 20),
                sodium_per_100mg=random.uniform(0,1500),
                fiber_per_100g=random.uniform(0, 15),
                
                ingredient, _ = Ingredient.objects.get_or_create(
                    name=ingredient_name,
                    calories_per_100g=random.uniform(50, 500),
                    protein_per_100g=random.uniform(1, 30),
                    carbs_per_100g=random.uniform(1, 50),
                    sugar_per_100g=random.uniform(0, 30),
                    fat_per_100g=random.uniform(0, 20),
                    sodium_per_100mg=random.uniform(0,1500),
                    fiber_per_100g=random.uniform(0, 15),
                )
                RecipeIngredient.objects.create(recipe=recipe, ingredient=ingredient, quantity=quantity, unit=unit, display_name=display_name)  # Create relationship

            return Response(RecipeSerializer(recipe).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class RecipeViewSet(viewsets.ModelViewSet):
    permission_classes=[IsAuthenticated]

    def list(self, request): #/api/Recipes
        Recipes = Recipe.objects.filter(user=self.request.user)
        serializer = RecipeSerializer(Recipes, many=True)
        return Response(serializer.data)
        
    def create(self, request):
        serializer = RecipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, pk=None): #/api/Recipes/<str:id>
        recipe = Recipe.objects.get(id=pk)
        serializer = RecipeSerializer(recipe)
        return Response(serializer.data)
    
    def update(self, request, pk=None): #/api/Recipes/<str:id>
        recipe = Recipe.objects.get(id=pk)
        serializer = RecipeSerializer(instance=recipe, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
    def destroy(self, request, pk=None): #/api/Recipes/<stor:id>
        recipe = Recipe.objects.get(id=pk)
        recipe.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class IngredientViewSet(viewsets.ViewSet):
    def list(self, request): #/api/Recipes
        ingredients = Ingredient.objects.all()
        serializer = IngredientSerializer(ingredients, many=True)
        return Response(serializer.data)
        
    def create(self, request):
        serializer = IngredientSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, pk=None): #/api/Recipes/<str:id>
        ingredient = Ingredient.objects.get(id=pk)
        serializer = IngredientSerializer(ingredient)
        return Response(serializer.data)
    
    def update(self, request, pk=None): #/api/Recipes/<str:id>
        ingredient = Ingredient.objects.get(id=pk)
        serializer = IngredientSerializer(instance=ingredient, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
    def destroy(self, request, pk=None): #/api/Recipes/<str:id>
        ingredient = Ingredient.objects.get(id=pk)
        ingredient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class RecipeIngredientViewSet(viewsets.ViewSet):
    def list(self, request): #/api/Recipes
        recipe_ingredient = RecipeIngredient.objects.all()
        serializer = RecipeIngredientSerializer(recipe_ingredient, many=True)
        return Response(serializer.data)
        
    def create(self, request):
        serializer = RecipeIngredientSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, pk=None): #/api/Recipes/<str:id>
        recipe_ingredient = RecipeIngredient.objects.get(id=pk)
        serializer = RecipeIngredientSerializer(recipe_ingredient, many=True)
        return Response(serializer.data)
    
    def update(self, request, pk=None): #/api/Recipes/<str:id>
        recipe_ingredient = RecipeIngredient.objects.get(id=pk)
        serializer = RecipeIngredientSerializer(instance=recipe_ingredient, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
    def destroy(self, request, pk=None): #/api/Recipes/<str:id>
        recipe_ingredient = RecipeIngredient.objects.get(id=pk)
        recipe_ingredient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
