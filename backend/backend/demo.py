import random
import uuid
from datetime import date, timedelta

import django
from django.contrib.auth.models import User
from faker import Faker

from backend.apps.meal_plan.models.meal_plan import MealPlan
from backend.apps.recipes.models.ingredients import (Aisle, Ingredient,
                                                     RecipeIngredient)
from backend.apps.recipes.models.recipe import Recipe, Step

ingredients_data_1 = [
    {"name": "Vegetable Oil", "aisle": "Dairy", "quantity": "2", "units": "tablespoons"},
    {"name": "Beef Sirloin", "aisle": "Meat & Poultry", "quantity": "1", "units": "pound"},
    {"name": "Broccoli", "aisle": "Produce", "quantity": "1.5", "units": "cups"},
    {"name": "Red Bell Pepper", "aisle": "Produce", "quantity": "1", "units": "each"},
    {"name": "Carrots", "aisle": "Produce", "quantity": "2", "units": "each"},
    {"name": "Green Onion", "aisle": "Produce", "quantity": "1", "units": "each"},
    {"name": "Minced Garlic", "aisle": "Produce", "quantity": "1", "units": "teaspoon"},
    {"name": "Soy Sauce", "aisle": "Canned Goods", "quantity": "2", "units": "tablespoons"},
    {"name": "Sesame Seeds", "aisle": "Snacks", "quantity": "2", "units": "tablespoons"},
]

ingredients_data_2 = [
    {"name": "ketchup", "aisle": "Dairy", "quantity": "1/2", "units": "cup"},
    {"name": "honey", "aisle": "Meat & Poultry", "quantity": "2", "units": "tablespoons"},
    {"name": "low-sodium soy sauce", "aisle": "Produce", "quantity": "2", "units": "tablespoons"},
    {"name": "crushed", "aisle": "Produce", "quantity": "2", "units": "cloves"},
]

steps_1 = [
    {"step_number": "1", "description": "Gather ingredients."},
    {"step_number": "2", "description": "Overhead of stir-fry ingredients in various bowls. \
                                        Dotdash Meredith Food Studios \
                                        Heat vegetable oil in a large wok or skillet over medium-high heat; add beef and stir-fry until browned, 3 to 4 minutes."
    },
    {"step_number": "3", "description": "Overhead of chopped vegatables, beef, and seseme seeds being cooked together in a wok. \
                                        Dotdash Meredith Food Studios\
                                        Serve hot and enjoy!"
    },
]

steps_2 = [
    {"step_number": "1", "description": "Preheat grill for medium heat and lightly oil the grate. Gather ingredients."},
    {"step_number": "2", "description": "Four raw, bone-in pork chops on a baking sheet with 4 small bowls of ingredients on the side Whisk ketchup, honey, soy sauce, and garlic together in a bowl to make a glaze."},
    {"step_number": "3", "description": "Overhead view of brown sauce inside of a clear glass bowl and a hand with a whisk stirring said sauce Sear the pork chops on both sides on the preheated grill. Lightly brush glaze onto each side of the chops as they cook; grill until no longer pink in the center, about 7 to 9 minutes per side. An instant-read thermometer inserted into the center should read 145 degrees F (63 degrees C)."},
    {"step_number": "4", "description": "Overhead view of 4 pork chops on a griddle. Brush with sauce on the surface of one of the pork chops.Serve hot and enjoy!"},
]



recipe_data = [
    {"name": "Beef Stirfry", "main_ingredient": "beef", "ingredients": ingredients_data_1, "steps": steps_1},
    {"name": "Honey Garlic Pork Chops", "main_ingredient": "pork", "ingredients": ingredients_data_2, "steps": steps_2}
]


def create_users():
    users=[]
    if not User.objects.filter(username="demo@email.com").exists():
        user = User.objects.create_user(
            username="demo@email.com",
            password="password$"
        )
        users.append(user)
    else:
        print("User with this username already exists.")
    
    return users

    
def create_aisles():
    aisle_names = ["Produce", "Dairy", "Deli", "Meat & Poultry","Pasta", "Snacks", "Canned Goods"]
    user =User.objects.filter(id=1).first()
    aisles = []
    for aisle_name in aisle_names:
        if not Aisle.objects.filter(name=aisle_name).exists():
            aisle, _ = Aisle.objects.get_or_create(
                name=aisle_name,
                llm_generated=random.choice([True, False]),
                updated_by_user=random.choice([True, False]),
                user=user      
            )
            aisles.append(aisle)
    return aisles

# def create_ingredients():
#     ingredients = []
#     for data in ingredients_data:
#         aisle = Aisle.objects.filter(name=data["aisle"]).first()
#         if not Ingredient.objects.filter(name=data["name"]).exists():
#             ingredient, _ = Ingredient.objects.get_or_create(
#                 name=data["name"],
#                 calories_per_100g=random.uniform(50, 500),
#                 protein_per_100g=random.uniform(1, 30),
#                 carbs_per_100g=random.uniform(1, 50),
#                 sugar_per_100g=random.uniform(0, 30),
#                 fat_per_100g=random.uniform(0, 20),
#                 sodium_per_100mg=random.uniform(0, 1500),
#                 fiber_per_100g=random.uniform(0, 15),
#                 aisle=aisle
#             )
#             ingredients.append(ingredient)
    
#     return ingredients

# def create_recipes():
#     recipes = []
#     for recipe_dict in recipe_data:
#         user =User.objects.filter(id=1).first()
#         prep_time = random.randint(5, 30)
#         cook_time = random.randint(10, 60)
        
#         recipe = Recipe.objects.create(
#             user=user,
#             name=recipe_dict['name'],
#             prep_time=prep_time,
#             cook_time=cook_time,
#             total_time=prep_time + cook_time,
#             source_url="www.recipes.com",
#             image_url=None,
#             main_ingredient=recipe_dict['main_ingredient']
#         )
#         recipes.append(recipe)  # Append the recipe to the list
#     return recipes

def create_recipe_ingredients():
    for recipe_ in recipe_data:
        # Ensure the recipe is created if it doesn't exist
        user =User.objects.filter(id=1).first()
        prep_time = random.randint(5, 30)
        cook_time = random.randint(10, 60)
        recipe, created = Recipe.objects.get_or_create(
            name=recipe_['name'],
            user=user,
            prep_time=prep_time,
            cook_time=cook_time,
            total_time=prep_time + cook_time,
            source_url="www.recipes.com",
            image_url=None,
            main_ingredient=recipe_['main_ingredient'],
            steps=recipe_['steps']
        )
        
        # Iterate through the ingredients of the recipe
        
        for ingredient_data in recipe_['ingredients']:
            aisle = Aisle.objects.filter(name=ingredient_data['aisle']).first()
            # Ensure each ingredient is created if it doesn't exist
            ingredient, created = Ingredient.objects.get_or_create(
                name=ingredient_data['name'],
                calories_per_100g=random.uniform(50, 500),
                protein_per_100g=random.uniform(1, 30),
                carbs_per_100g=random.uniform(1, 50),
                sugar_per_100g=random.uniform(0, 30),
                fat_per_100g=random.uniform(0, 20),
                sodium_per_100mg=random.uniform(0, 1500),
                fiber_per_100g=random.uniform(0, 15),
                aisle=aisle
            )
            
            # Create RecipeIngredient association, checking if it already exists
            RecipeIngredient.objects.get_or_create(
                recipe=recipe,
                ingredient=ingredient,
                quantity=ingredient_data['quantity'],
                unit=ingredient_data['units'],
                display_name=ingredient.name
            )

def create_meal_plans():
    meal_types = ["breakfast", "lunch", "dinner"]
    meal_plans = []

    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())  
    end_of_week = start_of_week + timedelta(days=6)  

    random_recipe_data = random.choice(recipe_data)
    recipe_name = random_recipe_data['name']

    # Find the corresponding recipe using the name
    recipe = Recipe.objects.filter(name=recipe_name).first()

    for _ in range(3):
        random_day = start_of_week + timedelta(days=random.randint(0, 6))
        meal_type = random.choice(meal_types)
        meal_plan = MealPlan.objects.create(
            day_planned=random_day,
            meal_type=meal_type,
            recipe=recipe
        )
        
        meal_plans.append(meal_plan)

    return meal_plans


def generate_fake_data():
    print("Generating test data...")
    create_users()
    create_aisles()
    # create_ingredients()
    # create_recipes()
    create_recipe_ingredients()
    create_meal_plans() 
    print("Test data generated successfully!")

generate_fake_data()
