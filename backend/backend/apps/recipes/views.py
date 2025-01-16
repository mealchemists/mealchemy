from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Recipe
from .serializers import RecipeSerializer

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