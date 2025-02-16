from rest_framework import viewsets, status, mixins, generics
from rest_framework.response import Response
from .models import Recipe, Ingredient, RecipeIngredient, MealPlan
from .serializers import RecipeSerializer, IngredientSerializer, RecipeIngredientSerializer, MealplanSerializer

class RecipeViewSet(viewsets.ViewSet):
    def list(self, request): #/api/Recipes
        Recipes = Recipe.objects.all()
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
        Ingredients = Ingredient.objects.all()
        serializer = IngredientSerializer(Ingredients, many=True)
        return Response(serializer.data)
        
    def create(self, request):
        serializer = IngredientSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, pk=None): #/api/Recipes/<str:id>
        Ingredient = Ingredient.objects.get(id=pk)
        serializer = IngredientSerializer(Recipe)
        return Response(serializer.data)
    
    def update(self, request, pk=None): #/api/Recipes/<str:id>
        Ingredient = Ingredient.objects.get(id=pk)
        serializer = IngredientSerializer(instance=Ingredient, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
    def destroy(self, request, pk=None): #/api/Recipes/<str:id>
        Ingredient = Ingredient.objects.get(id=pk)
        Ingredient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class MealplanViewSet(viewsets.ViewSet):
    def list(self, request): #/api/Recipes
        meal_plans = MealPlan.objects.all()
        serializer = MealplanSerializer(meal_plans, many=True)
        return Response(serializer.data)
        
    def create(self, request):
        serializer = MealplanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, pk=None): #/api/Recipes/<str:id>
        meal_plan = MealPlan.objects.get(id=pk)
        serializer = MealplanSerializer(meal_plan)
        return Response(serializer.data)
    
    def update(self, request, pk=None): #/api/Recipes/<str:id>
        meal_plan = MealPlan.objects.get(id=pk)
        serializer = MealplanSerializer(instance=meal_plan, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
    def destroy(self, request, pk=None): #/api/Recipes/<str:id>
        meal_plan = MealPlan.objects.get(id=pk)
        MealPlan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)