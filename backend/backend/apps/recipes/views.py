from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, mixins, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
import random
from django.http import Http404
from ..meal_plan.models.meal_plan import MealPlan
from .models.ingredients import Ingredient, RecipeIngredient
from .models.recipe import Recipe
from .producer import publish
from .serializers import (IngredientSerializer, RecipeIngredientSerializer,
                          RecipeSerializer)
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import IntegrityError
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters

@api_view(['POST'])
@permission_classes([AllowAny])  
def save_scraped_data(request):
    permission_classes = [AllowAny]
    # Authenticate the user using the token passed in the request
    jwt_auth = JWTAuthentication()
    user, _ = jwt_auth.authenticate(request)  # Authenticate using the token
    
    if request.method == 'POST':
        ingredients = request.data["ingredients"]
        
        recipe_serialzer = RecipeSerializer(data=request.data["recipe"])
        recipe_serialzer.is_valid(raise_exception=True)
        recipe = recipe_serialzer.save(user=user)
        
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
        user_id = request.user.id
        data['user'] = user_id
        
        # Generate JWT token for the user
        user = User.objects.get(id=user_id)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # Add the token to the data to send via message queue
        data['token'] = access_token
        print(f"Generated token for user {user_id}: {access_token}")
        
        # Publish to message queue
        publish(data)
        
        return Response(data, status=status.HTTP_201_CREATED)

        
class RecipeIngredientsAPIView(APIView):
    # Apply filter backends for search and filtering
    filter_backends = (filters.SearchFilter, DjangoFilterBackend)
    filterset_fields = ["recipe__name"]  # You can filter by recipe name
    search_fields = ['recipe__name', 'ingredient__name']  # Allow search on recipe and ingredient name

    def get_queryset(self):
        # Default queryset, only recipes related to the current user
        queryset = RecipeIngredient.objects.filter(recipe__user=self.request.user).prefetch_related('recipe', 'ingredient')
        return queryset
    
    def get_object(self, pk):
        try:
            return RecipeIngredient.objects.get(pk=pk)
        except RecipeIngredient.DoesNotExist:
            raise Http404
    
    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Manually apply search filter
        search = request.query_params.get('search', None)
        if search:
            queryset = filters.SearchFilter().filter_queryset(request, queryset, self)


        if not self.kwargs:
            # If no ID is provided, return all recipes grouped with their ingredients
            recipes = {}
            for ri in queryset:
                recipe_id = ri.recipe.id
                if recipe_id not in recipes:
                    recipes[recipe_id] = {
                        "id": ri.id,
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
                "id": ri.id,
                "recipe": recipe_data,
                "ingredients": ingredients_data
            },
            status=status.HTTP_200_OK
        )
        
    def post(self, request, *args, **kwargs):
        # serialize entire recipe object
        data = request.data
        data["recipe"]["user"] = self.request.user.id
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
                # todo fix quanity and unit
                # if not ingredient_name or not quantity or not unit:
                if not ingredient_name:
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
                
                try:
                    ingredient, created = Ingredient.objects.get_or_create(
                        name=ingredient_name,
                        defaults={
                            'calories_per_100g': calories_per_100g,
                            'protein_per_100g': protein_per_100g,
                            'carbs_per_100g': carbs_per_100g,
                            'sugar_per_100g': sugar_per_100g,
                            'fat_per_100g': fat_per_100g,
                            'sodium_per_100mg': sodium_per_100mg,
                            'fiber_per_100g': fiber_per_100g,
                        }
                    )
                except IntegrityError:
                    # If an IntegrityError occurs, we simply ignore it and continue
                    ingredient = Ingredient.objects.get(name=ingredient_name)
                RecipeIngredient.objects.create(recipe=recipe, ingredient=ingredient, quantity=quantity, unit=unit, display_name=display_name)  # Create relationship

            return Response(RecipeSerializer(recipe).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, *args, **kwargs):
        data = request.data
        data["recipe"]["user"] = self.request.user.id
        recipe_id = request.data["recipe"].get('id', None)  # Get recipe_id if editing an existing recipe
        
        # Fetch the existing recipe if recipe_id exists
        if recipe_id:
            try:
                recipe = Recipe.objects.get(id=recipe_id)
                serializer = RecipeSerializer(recipe, data=request.data['recipe'])
            except Recipe.DoesNotExist:
                return Response({"error": "Recipe not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": "Recipe ID is required for update"}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            # Fully update the recipe by saving all fields
            serializer.save()

            # First, delete all associated ingredients in RecipeIngredient
            RecipeIngredient.objects.filter(recipe=recipe).delete()

            ingredients_data = request.data.get('ingredients', [])  # Extract ingredients

            for ingredient_data in ingredients_data:
                ingredient_name = ingredient_data.get('name')
                quantity = ingredient_data.get('quantity')
                unit = ingredient_data.get('unit')
                display_name = ingredient_data.get('display_name')

                if not display_name:
                    display_name = ingredient_name

                if not ingredient_name:
                    return Response({"error": "Missing ingredient data"}, status=status.HTTP_400_BAD_REQUEST)

                # Handle random nutrition data if not already provided
                calories_per_100g = random.uniform(50, 500)
                protein_per_100g = random.uniform(1, 30)
                carbs_per_100g = random.uniform(1, 50)
                sugar_per_100g = random.uniform(0, 30)
                fat_per_100g = random.uniform(0, 20)
                sodium_per_100mg = random.uniform(0, 1500)
                fiber_per_100g = random.uniform(0, 15)

                try:
                    # Check if the ingredient exists, if not, create it
                    ingredient, created = Ingredient.objects.get_or_create(
                        name=ingredient_name,
                        defaults={
                            'calories_per_100g': calories_per_100g,
                            'protein_per_100g': protein_per_100g,
                            'carbs_per_100g': carbs_per_100g,
                            'sugar_per_100g': sugar_per_100g,
                            'fat_per_100g': fat_per_100g,
                            'sodium_per_100mg': sodium_per_100mg,
                            'fiber_per_100g': fiber_per_100g,
                        }
                    )
                except IntegrityError:
                    # If an IntegrityError occurs, we simply ignore it and continue
                    ingredient = Ingredient.objects.get(name=ingredient_name)

                # Create RecipeIngredient relationships
                RecipeIngredient.objects.create(
                    recipe=recipe,
                    ingredient=ingredient,
                    quantity=quantity,
                    unit=unit,
                    display_name=display_name
                )

            return Response(RecipeSerializer(recipe).data, status=status.HTTP_200_OK)

        return Response("error", status=status.HTTP_400_BAD_REQUEST)
    
    
    def delete(self, request, *args, **kwargs):
        pk = kwargs.get("pk")
        print(pk)
        if pk:
            recipe_ingredient = self.get_object(pk=pk)
            recipe = recipe_ingredient.recipe
            recipe_ingredient.delete()
            recipe.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response("Failes", status=status.HTTP_400_BAD_REQUEST)
        
    
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
    
