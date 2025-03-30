from datetime import timedelta

from django.db import models
from django.utils.timezone import now

from backend.apps.recipes.models.recipe import Recipe
from backend.models import TimeStampedModel


class MealPlan(TimeStampedModel):
    day_planned = models.DateField(null=True)
    meal_type = models.CharField(max_length=255, null=True, help_text="breakfast/lunch/dinner")
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, null=True)

    @classmethod
    def get_week_meals(cls):
        today = now().date()
        start_of_week = today - timedelta(days=today.weekday())  # Monday
        end_of_week = start_of_week + timedelta(days=6)  # Sunday

        return cls.objects.filter(day_planned__range=[start_of_week, end_of_week]).order_by("day_planned")
