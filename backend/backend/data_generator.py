import random
import django
from faker import Faker
from backend.apps.recipes.models.recipe import Recipe
from backend.apps.meal_plan.models.meal_plan import MealPlan
from backend.apps.recipes.models.ingredients import Aisle, Ingredient, RecipeIngredient
from django.contrib.auth.models import User
from datetime import timedelta, date
import uuid

# Initialize Faker
fake = Faker()

def create_users(n=5):
    users = []
    for _ in range(n):
        user = User.objects.create_user(
            username=fake.user_name(), 
            email=fake.email(), 
            password="password123"
        )
        users.append(user)
    return users

def create_aisles(n=10):
    aisles = []
    for _ in range(n):
        aisle, _ = Aisle.objects.get_or_create(
            name=fake.word().capitalize(),
            llm_generated=random.choice([True, False]),
            updated_by_user=random.choice([True, False])
        )
        aisles.append(aisle)
    return aisles

def create_ingredients(n=20, aisles=None):
    ingredients = []
    for _ in range(n):
        aisle = random.choice(aisles) if aisles else None
        ingredient, _ = Ingredient.objects.get_or_create(
            name="TEST-OBJECT-" + str(uuid.uuid4()),
            calories_per_100g=random.uniform(50, 500),
            protein_per_100g=random.uniform(1, 30),
            carbs_per_100g=random.uniform(1, 50),
            sugar_per_100g=random.uniform(0, 30),
            fat_per_100g=random.uniform(0, 20),
            sodium_per_100mg=random.uniform(0,1500),
            fiber_per_100g=random.uniform(0, 15),
            aisle=aisle
        )
        ingredients.append(ingredient)
    return ingredients

def create_recipes(n=10, users=None):
    recipes = []
    for _ in range(n):
        user = random.choice(users) if users else None
        prep_time = random.randint(5, 30)
        cook_time = random.randint(10, 60)
        recipe = Recipe.objects.create(
            user=user,
            name=fake.sentence(nb_words=3),
            prep_time=prep_time,
            cook_time=cook_time,
            total_time=prep_time + cook_time,
            source_url=fake.url(),
            steps=fake.paragraph(nb_sentences=5)
        )
        recipes.append(recipe)
    return recipes

def create_recipe_ingredients(recipes, ingredients):
    for recipe in recipes:
        used_ingredients = set()  # Track added ingredients for each recipe
        for _ in range(random.randint(3, 7)):
            ingredient = random.choice(ingredients)
            
            if ingredient in used_ingredients:
                continue  # Skip if already added
            
            RecipeIngredient.objects.get_or_create(
                recipe=recipe,
                ingredient=ingredient,
                defaults={
                    "quantity": str(random.randint(1, 5)),
                    "unit": random.choice(["g", "kg", "ml", "cup", "tbsp", "tsp"]),
                    "display_name": ingredient.name
                }
            )
            used_ingredients.add(ingredient)

def create_meal_plans(n=20, recipes=None):
    meal_types = ["breakfast", "lunch", "dinner"]
    meal_plans = []

    for _ in range(n):
        recipe = random.choice(recipes)
        
        # Generate a date within the past or next 30 days
        random_days_offset = random.randint(-30, 30)
        day_planned = date.today() + timedelta(days=random_days_offset)

        meal_plan = MealPlan.objects.create(
            day_planned=day_planned,
            meal_type=random.choice(meal_types),
            recipe=recipe
        )
        meal_plans.append(meal_plan)

    return meal_plans


def generate_fake_data():
    print("Generating test data...")
    users = create_users()
    aisles = create_aisles()
    ingredients = create_ingredients()
    recipes = create_recipes(users=users)
    create_recipe_ingredients(recipes, ingredients)
    create_meal_plans(recipes=recipes)  # Add meal plans
    print("Test data generated successfully!")

generate_fake_data()
