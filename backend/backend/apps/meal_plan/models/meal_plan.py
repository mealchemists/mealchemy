from backend.models import TimeStampedModel
from django.db import models

from backend.apps.recipes.models.recipe import Recipe

class MealPlan(TimeStampedModel):
    day_planned = models.TimeField(null=True)
    meal_type = models.CharField(max_length=255, null=True, help_text="breakfast/lunch/dinner")
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, null=True)
