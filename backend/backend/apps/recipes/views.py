from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Recipe
from .serializers import RecipeSerializer, IngredientSerializer
from rest_framework.decorators import api_view
from .producer import publish

@api_view(['POST'])
def save_scraped_data(request):
    if request.method == 'POST':
        recipe_serialzer = RecipeSerializer(data=request.data["recipe"])
        ingredient_serializer = IngredientSerializer(data=request.data["ingredients"], many=True)
        
        recipe_serialzer.is_valid(raise_exception=True)
        ingredient_serializer.is_valid(raise_exception=True)
        
        recipe_serialzer.save()
        ingredient_serializer.save()
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
        Recipe = Recipe.objects.get(id=pk)
        serializer = RecipeSerializer(Recipe)
        return Response(serializer.data)
    
    def update(self, request, pk=None): #/api/Recipes/<str:id>
        Recipe = Recipe.objects.get(id=pk)
        serializer = RecipeSerializer(instance=Recipe, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
    def destroy(self, request, pk=None): #/api/Recipes/<str:id>
        Recipe = Recipe.objects.get(id=pk)
        Recipe.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)