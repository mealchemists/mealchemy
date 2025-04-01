from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, mixins, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
import random
from django.db.models import Q
from django.http import Http404
from ..meal_plan.models.meal_plan import MealPlan
from .models.ingredients import Ingredient, RecipeIngredient, Aisle
from .models.recipe import Recipe, Step
from .producer import publish
from .serializers import (
    IngredientSerializer,
    RecipeIngredientSerializer,
    RecipeSerializer,
    AisleSerializer,
    StepSerializer,
)
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import IntegrityError
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters


@api_view(["POST"])
@permission_classes([AllowAny])
def save_scraped_data(request):
    permission_classes = [AllowAny]
    # Authenticate the user using the token passed in the request
    jwt_auth = JWTAuthentication()
    # Authenticate using the token
    user, _ = jwt_auth.authenticate(request)  # type: ignore

    recipe_data = request.data["recipe"].copy()
    recipe_data["steps"] = request.data.get("steps", [])

    recipe_serializer = RecipeSerializer(data=recipe_data)
    if not recipe_serializer.is_valid():
        return Response(recipe_serializer.errors, status=400)

    try:
        recipe = recipe_serializer.save(user=user)

        ingredients = request.data["ingredients"]
        for ingredient_data in ingredients:
            # TODO: handle nutrition information
            # TODO: handle fuzzy Ingredient retrieval in a different function
            calories_per_100g = random.uniform(50, 500)
            protein_per_100g = random.uniform(1, 30)
            carbs_per_100g = random.uniform(1, 50)
            sugar_per_100g = random.uniform(0, 30)
            fat_per_100g = random.uniform(0, 20)
            sodium_per_100mg = random.uniform(0, 1500)
            fiber_per_100g = random.uniform(0, 15)

            try:
                ingredient, created = Ingredient.objects.get_or_create(
                    name=ingredient_data["name"],
                    defaults={
                        "calories_per_100g": calories_per_100g,
                        "protein_per_100g": protein_per_100g,
                        "carbs_per_100g": carbs_per_100g,
                        "sugar_per_100g": sugar_per_100g,
                        "fat_per_100g": fat_per_100g,
                        "sodium_per_100mg": sodium_per_100mg,
                        "fiber_per_100g": fiber_per_100g,
                    },
                )
            except IntegrityError:
                # If an IntegrityError occurs, we simply ignore it and continue
                ingredient = Ingredient.objects.get(name=ingredient_data["name"])

            RecipeIngredient.objects.create(
                recipe=recipe,
                ingredient=ingredient,
                quantity=ingredient_data["quantity"],
                unit=ingredient_data["unit"],
                display_name=ingredient_data["name"],
            )  # Create relationship
        return Response(recipe_serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # if request.method == "POST":
    #     ingredients = request.data["ingredients"]
    #
    #     recipe_serializer = RecipeSerializer(data=request.data["recipe"])
    #     recipe_serializer.is_valid(raise_exception=True)
    #     recipe = recipe_serializer.save(user=user)
    #
    #     for ingredient_data in ingredients:
    #         ingredient_serializer = IngredientSerializer(
    #             data={"name": ingredient_data["name"]}
    #         )
    #         if ingredient_serializer.is_valid():
    #             ingredient = ingredient_serializer.save()
    #             RecipeIngredient.objects.create(
    #                 recipe=recipe,
    #                 ingredient=ingredient,
    #                 quantity=ingredient_data["quantity"],
    #                 unit=ingredient_data["unit"],
    #             )
    #
    #     return Response(
    #         {"cart": recipe_serializer.data, "another": ingredient_serializer.data}
    #     )


@api_view(["POST"])
def recipe_url(request):
    if request.method == "POST":
        data = request.data
        user_id = request.user.id
        data["user"] = user_id

        # Generate JWT token for the user
        user = User.objects.get(id=user_id)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Add the token to the data to send via message queue
        data["token"] = access_token
        print(f"Generated token for user {user_id}: {access_token}")

        # Publish to message queue
        publish(data)

        return Response(data, status=status.HTTP_201_CREATED)


class RecipeIngredientsAPIView(APIView):
    # Apply filter backends for search and filtering
    filter_backends = (
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    )
    filterset_fields = ["recipe__cook_time", "recipe__main_ingredient"]
    search_fields = ["recipe__name", "ingredient__name", "recipe__main_ingredient"]
    ordering_fields = ["recipe__cook_time"]
    ordering = "recipe__created_at"

    def get_queryset(self):
        # Default queryset, only recipes related to the current user
        queryset = RecipeIngredient.objects.filter(
            recipe__user=self.request.user
        ).prefetch_related("recipe", "ingredient")
        return queryset

    def get_object(self, pk):
        try:
            return RecipeIngredient.objects.get(pk=pk)
        except RecipeIngredient.DoesNotExist:
            raise Http404

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        queryset = self.parse_query_params(queryset, request)

        if not self.kwargs:
            # If no ID is provided, return all recipes grouped with their ingredients
            recipes = {}
            for ri in queryset:
                recipe_id = ri.recipe.id
                if recipe_id not in recipes:
                    recipes[recipe_id] = {
                        "id": ri.id,
                        "recipe": RecipeSerializer(ri.recipe).data,
                        "ingredients": [],
                    }

                recipes[recipe_id]["ingredients"].append(
                    {
                        "quantity": ri.quantity,
                        "unit": ri.unit,
                        "display_name": ri.display_name,
                        "name": ri.ingredient.name,
                        "id": ri.ingredient.id,
                    }
                )

                # Add aisle only if it exists
                if ri.ingredient and getattr(ri.ingredient, "aisle", None):
                    ingredient_data["aisle"] = getattr(
                        ri.ingredient.aisle, "name", None
                    )

            return Response(list(recipes.values()), status=status.HTTP_200_OK)

        # If an ID is provided, filter by recipe ID
        recipe_id = self.kwargs["pk"]
        recipe_ingredients = queryset.filter(recipe_id=recipe_id)

        if not recipe_ingredients.exists():
            return Response(
                {"error": "No ingredients found for this recipe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Serialize recipe info
        recipe_data = RecipeSerializer(recipe_ingredients.first().recipe).data
        ingredient_data = IngredientSerializer()

        # Aggregate all ingredients into a list
        ingredients_data = [
            {
                "quantity": ri.quantity,
                "unit": ri.unit,
                "display_name": ri.display_name,
                "name": ri.ingredient.name,  # Assuming Ingredient has a `name` field
                "aisle": ri.ingredient.aisle,
                "id": ri.ingredient.id,
            }
            for ri in recipe_ingredients
        ]

        return Response(
            {"id": ri.id, "recipe": recipe_data, "ingredients": ingredients_data},
            status=status.HTTP_200_OK,
        )

    def post(self, request, *args, **kwargs):
        # serialize entire recipe object
        data = request.data
        data["recipe"]["user"] = self.request.user.id
        serializer = RecipeSerializer(data=request.data["recipe"])

        if serializer.is_valid():
            ingredients_data = request.data.pop(
                "ingredients", []
            )  # Extract ingredients
            recipe = Recipe.objects.create(**serializer.validated_data)  # Create Recipe

            for ingredient_data in ingredients_data:
                ingredient_name = ingredient_data.get("name")
                quantity = ingredient_data.get("quantity")
                unit = ingredient_data.get("unit")
                display_name = ingredient_data.get("display_name")
                aisle = ingredient_data.get("aisle")

                if not display_name:
                    display_name = ingredient_name
                # todo fix quanity and unit
                # if not ingredient_name or not quantity or not unit:
                if not ingredient_name:
                    return Response(
                        {"error": "Missing ingredient data"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                aisle_obj = Aisle.objects.filter(
                    user_id=data["recipe"]["user"], name=aisle
                )
                if not aisle_obj:
                    aisle_data = {"user": data["recipe"]["user"], "name": aisle}
                    aisle_serializer = AisleSerializer(data=aisle_data)
                    if aisle_serializer.is_valid():
                        aisle_obj = aisle_serializer.save()

                # TODO: handle nutrition information
                # TODO: handle fuzzy Ingredient retrieval in a different function
                calories_per_100g = random.uniform(50, 500)
                protein_per_100g = random.uniform(1, 30)
                carbs_per_100g = random.uniform(1, 50)
                sugar_per_100g = random.uniform(0, 30)
                fat_per_100g = random.uniform(0, 20)
                sodium_per_100mg = random.uniform(0, 1500)
                fiber_per_100g = random.uniform(0, 15)

                try:
                    ingredient, created = Ingredient.objects.get_or_create(
                        name=ingredient_name,
                        defaults={
                            "calories_per_100g": calories_per_100g,
                            "protein_per_100g": protein_per_100g,
                            "carbs_per_100g": carbs_per_100g,
                            "sugar_per_100g": sugar_per_100g,
                            "fat_per_100g": fat_per_100g,
                            "sodium_per_100mg": sodium_per_100mg,
                            "fiber_per_100g": fiber_per_100g,
                            "aisle": aisle_obj.id,
                        },
                    )
                except IntegrityError:
                    # If an IntegrityError occurs, we simply ignore it and continue
                    ingredient = Ingredient.objects.get(name=ingredient_name)
                RecipeIngredient.objects.create(
                    recipe=recipe,
                    ingredient=ingredient,
                    quantity=quantity,
                    unit=unit,
                    display_name=display_name,
                )  # Create relationship

            return Response(
                RecipeSerializer(recipe).data, status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        data = request.data
        data["recipe"]["user"] = self.request.user.id
        recipe_id = request.data["recipe"].get(
            "id", None
        )  # Get recipe_id if editing an existing recipe

        # Fetch the existing recipe if recipe_id exists
        if recipe_id:
            try:
                recipe = Recipe.objects.get(id=recipe_id)
                serializer = RecipeSerializer(recipe, data=request.data["recipe"])
            except Recipe.DoesNotExist:
                return Response(
                    {"error": "Recipe not found"}, status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(
                {"error": "Recipe ID is required for update"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if serializer.is_valid():
            # Fully update the recipe by saving all fields
            serializer.save()

            # First, delete all associated ingredients in RecipeIngredient
            RecipeIngredient.objects.filter(recipe=recipe).delete()

            ingredients_data = request.data.get(
                "ingredients", []
            )  # Extract ingredients

            for ingredient_data in ingredients_data:
                ingredient_name = ingredient_data.get("name")
                quantity = ingredient_data.get("quantity")
                unit = ingredient_data.get("unit")
                display_name = ingredient_data.get("display_name")
                aisle = ingredient_data.get("aisle")  # the aisle name

                if not display_name:
                    display_name = ingredient_name

                if not ingredient_name:
                    return Response(
                        {"error": "Missing ingredient data"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Handle random nutrition data if not already provided
                calories_per_100g = random.uniform(50, 500)
                protein_per_100g = random.uniform(1, 30)
                carbs_per_100g = random.uniform(1, 50)
                sugar_per_100g = random.uniform(0, 30)
                fat_per_100g = random.uniform(0, 20)
                sodium_per_100mg = random.uniform(0, 1500)
                fiber_per_100g = random.uniform(0, 15)

                # Check if aisle exists
                aisle_obj = Aisle.objects.filter(
                    user_id=data["recipe"]["user"], name=aisle
                )
                if not aisle_obj:
                    aisle_data = {"user": data["recipe"]["user"], "name": aisle}
                    aisle_serializer = AisleSerializer(data=aisle_data)
                    if aisle_serializer.is_valid():
                        aisle_serializer = aisle_serializer.save()
                        aisle_obj = aisle_serializer.save().id
                    else:
                        aisle_obj = None

                try:
                    # Check if the ingredient exists, if not, create it
                    ingredient, created = Ingredient.objects.get_or_create(
                        name=ingredient_name,
                        defaults={
                            "calories_per_100g": calories_per_100g,
                            "protein_per_100g": protein_per_100g,
                            "carbs_per_100g": carbs_per_100g,
                            "sugar_per_100g": sugar_per_100g,
                            "fat_per_100g": fat_per_100g,
                            "sodium_per_100mg": sodium_per_100mg,
                            "fiber_per_100g": fiber_per_100g,
                            "aisle": aisle_obj,
                        },
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
                    display_name=display_name,
                )

            return Response(RecipeSerializer(recipe).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

    def parse_query_params(self, queryset, request):
        query_params = request.query_params

        if not query_params:
            return queryset

        search = request.query_params.get("search", None)
        if search:
            queryset = filters.SearchFilter().filter_queryset(request, queryset, self)

        cook_time_min = query_params.get("cook_time_min", None)
        cook_time_max = query_params.get("cook_time_max", None)
        main_ingredient = query_params.get("main_ingredient", None)

        if cook_time_min:
            queryset = queryset.filter(recipe__cook_time__gte=cook_time_min)
        if cook_time_max:
            queryset = queryset.filter(recipe__cook_time__lte=cook_time_max)

            # Apply main ingredient filter
        if (
            main_ingredient
            and isinstance(main_ingredient, str)
            and main_ingredient.strip()
        ):
            queryset = queryset.filter(
                recipe__main_ingredient__iexact=main_ingredient.strip()
            )

        ordering = query_params.get("ordering", None)
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            # Default ordering if not specified (e.g., by recipe creation date)
            queryset = queryset.order_by("recipe__created_at")
        return queryset


class RecipeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):  # /api/Recipes
        Recipes = Recipe.objects.filter(user=self.request.user)
        serializer = RecipeSerializer(Recipes, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = RecipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):  # /api/Recipes/<str:id>
        recipe = Recipe.objects.get(id=pk)
        serializer = RecipeSerializer(recipe)
        return Response(serializer.data)

    def update(self, request, pk=None):  # /api/Recipes/<str:id>
        recipe = Recipe.objects.get(id=pk)
        serializer = RecipeSerializer(instance=recipe, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, pk=None):  # /api/Recipes/<stor:id>
        try:
            recipe = Recipe.objects.get(id=pk)
            recipe.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Recipe.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class IngredientViewSet(viewsets.ViewSet):
    def list(self, request):  # /api/Recipes
        ingredients = Ingredient.objects.all()
        serializer = IngredientSerializer(ingredients, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = IngredientSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):  # /api/Recipes/<str:id>
        ingredient = Ingredient.objects.get(id=pk)
        serializer = IngredientSerializer(ingredient)
        return Response(serializer.data)

    def update(self, request, pk=None):  # /api/Recipes/<str:id>
        ingredient = Ingredient.objects.get(id=pk)
        serializer = IngredientSerializer(instance=ingredient, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, pk=None):  # /api/Recipes/<str:id>
        ingredient = Ingredient.objects.get(id=pk)
        ingredient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RecipeIngredientViewSet(viewsets.ViewSet):
    def list(self, request):  # /api/Recipes
        recipe_ingredient = RecipeIngredient.objects.all()
        serializer = RecipeIngredientSerializer(recipe_ingredient, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = RecipeIngredientSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):  # /api/Recipes/<str:id>
        recipe_ingredient = RecipeIngredient.objects.get(id=pk)
        serializer = RecipeIngredientSerializer(recipe_ingredient, many=True)
        return Response(serializer.data)

    def update(self, request, pk=None):  # /api/Recipes/<str:id>
        recipe_ingredient = RecipeIngredient.objects.get(id=pk)
        serializer = RecipeIngredientSerializer(
            instance=recipe_ingredient, data=request.data
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, pk=None):  # /api/Recipes/<str:id>
        recipe_ingredient = RecipeIngredient.objects.get(id=pk)
        recipe_ingredient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AisleAPIView(APIView):
    def get(self, request, user_id, *args, **kwargs):
        aisles = Aisle.objects.filter(user_id=user_id)
        serializer = AisleSerializer(aisles, many=True)
        return Response(serializer.data)

    def post(self, request, user_id, *args, **kwargs):
        data = request.data
        data["user"] = user_id
        name = data.get("name")
        if Aisle.objects.filter(user_id=user_id, name=name).exists():
            return Response(
                {
                    "detail": "An aisle with this name already exists for the given user."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AisleSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
