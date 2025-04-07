from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, mixins, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound, PermissionDenied
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
from .models.units import Unit

from .producer import publish_message
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

import tempfile
import os
import json
import traceback

# The server will be the producer that will send messages to the queue.
# producer = Producer()


def get_jwt_token(user_id):
    # Generate JWT token for the user
    user = User.objects.get(id=user_id)
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)

def validate_aisle(aisle, request):
    user = request.user

    # Handle empty aisle name
    if not aisle:
        aisle_obj, _ = Aisle.objects.get_or_create(name="Uncategorized", user=user)
        return aisle_obj

    # Try to find existing aisle
    aisle_obj = Aisle.objects.filter(user=user, name=aisle).first()
    if aisle_obj:
        return aisle_obj

    # Create new aisle
    aisle_data = {"user": user.id, "name": aisle}
    aisle_serializer = AisleSerializer(data=aisle_data)
    if aisle_serializer.is_valid():
        return aisle_serializer.save()
    else:
        raise Exception({
            "aisle": f"Invalid aisle data: {aisle_serializer.errors}"
        })


@api_view(["POST"])
@permission_classes([AllowAny])
def save_scraped_data(request):
    permission_classes = [AllowAny]
    # Authenticate the user using the token passed in the request
    jwt_auth = JWTAuthentication()
    # Authenticate using the token
    user, _ = jwt_auth.authenticate(request)  # type: ignore

    needs_review_flag = True
    recipe_data = request.data["recipe"].copy()
    recipe_data["steps"] = request.data.get("steps", [])

    recipe_serializer = RecipeSerializer(data=recipe_data)
    if not recipe_serializer.is_valid():
        # Recipe Serializer may be missing fields
        return Response(recipe_serializer.errors, status=400)

    try:
        recipe = recipe_serializer.save(user=user)

        ingredients = request.data["ingredients"]
        for ingredient_data in ingredients:
            # TODO: handle nutrition information
            # TODO: handle fuzzy Ingredient retrieval in a different function
            aisle_name = ingredient_data.get("aisle", None)
            aisle = validate_aisle(aisle_name, request)
            calories_per_100g = random.uniform(50, 500)
            protein_per_100g = random.uniform(1, 30)
            carbs_per_100g = random.uniform(1, 50)
            sugar_per_100g = random.uniform(0, 30)
            fat_per_100g = random.uniform(0, 20)
            sodium_per_100mg = random.uniform(0, 1500)
            fiber_per_100g = random.uniform(0, 15)

            try:
                # Newly created recipe ingredients will be uncategorized.
                aisle, _ = Aisle.objects.get_or_create(
                    name="Uncategorized", user=request.user
                )

                ingredient, created = Ingredient.objects.get_or_create(
                    name=ingredient_data["name"],
                    aisle=aisle,
                    defaults={
                        "calories_per_100g": calories_per_100g,
                        "protein_per_100g": protein_per_100g,
                        "carbs_per_100g": carbs_per_100g,
                        "sugar_per_100g": sugar_per_100g,
                        "fat_per_100g": fat_per_100g,
                        "sodium_per_100mg": sodium_per_100mg,
                        "fiber_per_100g": fiber_per_100g,
                        "aisle": aisle,
                    },
                )
                if not created:
                    # If the ingredient already existed, we may still want to update its aisle
                    if ingredient.aisle != aisle:
                        ingredient.aisle = aisle
                        ingredient.save()
            except IntegrityError:
                ingredient = Ingredient.objects.get(name=ingredient_data["name"])
                if ingredient.aisle != aisle:
                    ingredient.aisle = aisle
                    ingredient.save()

            quantity = ingredient_data["quantity"]
            unit = ingredient_data["unit"]

            # Handle units that are given as count quantities
            if unit is None:
                unit = ""
            elif unit not in Unit:
                # Prevent saving non-measurement units from extracted data
                unit = ""

            RecipeIngredient.objects.create(
                recipe=recipe,
                ingredient=ingredient,
                quantity="" if quantity is None else quantity,
                unit="" if unit is None else unit,
                display_name=ingredient_data["name"],
                added_by_extractor=request.data.get("added_by_extractor", True), # this api is expected to be used only by extractors defau;t to true
            )  # Create relationship
        return Response(recipe_serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def recipe_url(request):
    if request.method == "POST":
        data = request.data
        user_id = request.user.id

        # Add the token to the data to send via message queue
        access_token = get_jwt_token(user_id)
        print(f"Generated token for user {user_id}: {access_token}")

        # construct message for consumer, sending the URL
        message = dict()
        message["user"] = user_id
        message["token"] = access_token
        message["task_type"] = "web"
        message["payload"] = {"url": data["url"]}

        success = publish_message(message)
        if success:
            return Response(
                {"message": "Queued recipe URL!"}, status=status.HTTP_200_OK
            )

        return Response(
            {"error": "Unable to queue recipe URL!"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@api_view(["POST"])
def recipe_pdf(request):
    if request.method == "POST":
        file = request.FILES.get("temp_file")
        user_id = request.user.id

        # store PDF file in tempdir
        temp_dir = tempfile.mkdtemp(prefix="mealchemy_pdf_upload")
        temp_path = os.path.join(temp_dir, file.name)

        with open(temp_path, "wb+") as dst:
            for chunk in file.chunks():
                dst.write(chunk)

        # Add the token to the data to send via message queue
        access_token = get_jwt_token(user_id)
        print(f"Generated token for user {user_id}: {access_token}")

        # construct message for consumer, sending the path to the tempfile
        message = dict()
        message["user"] = user_id
        message["token"] = access_token
        message["task_type"] = "pdf"
        message["payload"] = {"temp_path": temp_path}

        success = publish_message(message)
        if success:
            return Response(status=status.HTTP_200_OK)

        return Response(
            {"error": "Unable to publish message"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class RecipeIngredientsAPIView(APIView):
    # Apply filter backends for search and filtering
    filter_backends = (
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    )
    filterset_fields = [
        "recipe__cook_time",
        "recipe__main_ingredient",
        "needs_review",
        "ingredients__needs_review",
        "recipe__needs_review",
    ]
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
                        "needs_review": ri.needs_review,
                        "added_by_extractor": ri.added_by_extractor,
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
                        "aisle": ri.ingredient.aisle.name
                        if ri.ingredient.aisle
                        else None,
                        "needs_review": ri.needs_review,
                    }
                )

                # Add aisle only if it exists
                # if ri.ingredient and getattr(ri.ingredient, "aisle", None):
                #      recipes[recipe_id]["ingredients"]["aisle"] = getattr(
                #         ri.ingredient.aisle, "id", None
                #     )

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
                "needs_review": ri.needs_review,
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
               
                aisle_obj = validate_aisle(aisle, request)

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
                        user=self.request.user,
                        defaults={
                            "user": self.request.user,
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
                    ingredient = Ingredient.objects.get(
                        name=ingredient_name, id=self.request.user
                    )
                ri = RecipeIngredient.objects.create(
                    recipe=recipe,
                    ingredient=ingredient,
                    quantity=quantity,
                    unit=unit,
                    display_name=display_name,
                )  

            # Serialize the recipe object to get its data
            recipe_data = RecipeSerializer(recipe).data

            # Return the response with recipe and ingredients data
            return Response(
                {"id": ri.id, "recipe": recipe_data, "ingredients": ingredients_data},
                status=status.HTTP_201_CREATED
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

                aisle_obj = validate_aisle(aisle, request) 

                try:
                    # Check if the ingredient exists, if not, create it
                    ingredient, created = Ingredient.objects.get_or_create(
                        name=ingredient_name,
                        user=self.request.user,
                        defaults={
                            "user": self.request.user,
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
                    ingredient = Ingredient.objects.get(
                        name=ingredient_name, user=self.request.user
                    )

                # Create RecipeIngredient relationships
                ri = RecipeIngredient.objects.create(
                    recipe=recipe,
                    ingredient=ingredient,
                    quantity=quantity,
                    unit=unit,
                    display_name=display_name,
                )

                        # Serialize the recipe object to get its data
            recipe_data = RecipeSerializer(recipe).data

            # Return the response with recipe and ingredients data
            return Response(
                {"id": ri.id, "recipe": recipe_data, "ingredients": ingredients_data},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        pk = kwargs.get("pk")
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

        needs_review = request.query_params.get("needs_review", None)
        if needs_review and needs_review.lower() == "true":
            queryset = queryset.filter(
                Q(recipe__needs_review=True)
                | Q(ingredient__needs_review=True)
                | Q(needs_review=True)
            )
        elif needs_review and needs_review.lower() == "false":
            queryset = queryset.filter(
                recipe__needs_review=False,
                ingredient__needs_review=False,
                needs_review=False,
            )

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
            recipe = Recipe.objects.filter(user=self.request.user).get(id=pk)
            recipe.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Recipe.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class IngredientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):  # /api/Recipes
        ingredients = Ingredient.objects.filter(user=request.user)
        serializer = IngredientSerializer(ingredients, many=True)
        return Response(serializer.data)

    def create(self, request):
        request.data.update({"user": request.user.id})
        serializer = IngredientSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):  # /api/Recipes/<str:id>
        try:
            ingredient = Ingredient.objects.get(id=pk, user=request.user)
        except Ingredient.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = IngredientSerializer(ingredient)
        return Response(serializer.data)

    def update(self, request, pk=None):  # /api/Recipes/<str:id>
        try:
            ingredient = Ingredient.objects.get(id=pk, user=request.user)
        except Ingredient.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        request.data.pop("user", None)  # prevent user field modification

        serializer = IngredientSerializer(instance=ingredient, data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, pk=None):  # /api/Recipes/<str:id>
        try:
            ingredient = Ingredient.objects.get(id=pk, user=request.user)
            ingredient.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Ingredient.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class RecipeIngredientViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):  # /api/Recipes
        recipe_ingredient = RecipeIngredient.objects.filter(
            recipe__user=self.request.user
        )
        serializer = RecipeIngredientSerializer(recipe_ingredient, many=True)
        return Response(serializer.data)

    def create(self, request):
        try:
            _ = Recipe.objects.get(id=request.data.get("recipe"), user=request.user)
        except Recipe.DoesNotExist:
            raise PermissionDenied("You do not own this recipe!")

        serializer = RecipeIngredientSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):  # /api/Recipes/<str:id>
        try:
            recipe_ingredient = RecipeIngredient.objects.filter(
                recipe__user=self.request.user
            ).get(id=pk)
        except RecipeIngredient.DoesNotExist:
            raise NotFound("Recipe ingredient not found!")

        serializer = RecipeIngredientSerializer(recipe_ingredient)
        return Response(serializer.data)

    def update(self, request, pk=None):  # /api/Recipes/<str:id>
        try:
            recipe_ingredient = RecipeIngredient.objects.filter(
                recipe__user=self.request.user
            ).get(id=pk)
        except RecipeIngredient.DoesNotExist:
            raise NotFound("Recipe ingredient not found!")

        serializer = RecipeIngredientSerializer(
            instance=recipe_ingredient, data=request.data
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, pk=None):  # /api/Recipes/<str:id>
        try:
            recipe_ingredient = RecipeIngredient.objects.filter(
                recipe__user=self.request.user
            ).get(id=pk)
            recipe_ingredient.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except RecipeIngredient.DoesNotExist:
            raise NotFound("Recipe ingredient not found!")


class AisleAPIView(APIView):
    def get(self, request, user_id, *args, **kwargs):
        aisles = Aisle.objects.filter(user_id=user_id)
        serializer = AisleSerializer(aisles, many=True)
        return Response(serializer.data)

    def post(self, request, user_id, *args, **kwargs):
        data = request.data
        name = data.get("name")
        if Aisle.objects.filter(user_id=user_id, name=name).exists():
            return Response(
                {
                    "detail": "An aisle with this name already exists for the given user."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        aisleData = {"name": name, "user": user_id}

        serializer = AisleSerializer(data=aisleData)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
