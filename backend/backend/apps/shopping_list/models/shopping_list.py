from django.db import models

from backend.apps.recipes.models import RecipeIngredient
from backend.models import TimeStampedModel
from django.contrib.auth.models import User


class ShoppingList(TimeStampedModel):
    ingredient = models.ForeignKey(RecipeIngredient, on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(User,on_delete=models.CASCADE)

    

