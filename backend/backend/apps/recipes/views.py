from rest_framework import viewsets, status, mixins, generics
from rest_framework.response import Response
from .models.recipe import Recipe
from .models.ingredients import Ingredient, RecipeIngredient
from ..meal_plan.models.meal_plan import MealPlan
from .serializers import RecipeSerializer, IngredientSerializer, RecipeIngredientSerializer
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from .producer import publish

@api_view(['POST'])
def save_scraped_data(request):
    if request.method == 'POST':
        ingredients = request.data["ingredients"]
        
        # ingredient_data =  [{"name": ingredient["name"]} for ingredient in ingredients] 
        # ingredient_serializer = IngredientSerializer(data=ingredient_data, many=True)   
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
    
        
class RecipeIngredientsAPIView(generics.ListAPIView):
    serializer_class = RecipeIngredientSerializer

    def get_queryset(self):
        recipe_id = self.kwargs["pk"]
        return RecipeIngredient.objects.prefetch_related("recipe", "ingredient").filter(recipe_id=recipe_id)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        recipe = queryset.first().recipe
        recipe_serializer = RecipeSerializer(recipe)
        
        ingredients = [ri.ingredient for ri in queryset]
        ingredient_serializer = IngredientSerializer(ingredients, many=True)
        
        recipe_data = {
            "recipe": recipe_serializer.data,
            "ingredients": ingredient_serializer.data
        }
        
        return Response(recipe_data, status=status.HTTP_200_OK)
        
        
        
        
    
class RecipeViewSet(viewsets.ModelViewSet):
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
        Ingredient = Ingredient.objects.get(id=pk)
        Ingredient.delete()
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
    