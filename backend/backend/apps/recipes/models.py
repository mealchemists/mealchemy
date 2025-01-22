from django.db import models
from backend.models import TimeStampedModel

class Recipe(TimeStampedModel):
    name = models.CharField(max_length=255)
    description = models.TextField()
    servings = models.IntegerField()
    prep_time = models.IntegerField(help_text="Preparation time in minutes")
    cook_time = models.IntegerField(help_text="Cooking time in minutes")
    total_time = models.IntegerField(help_text="Total time in minutes")
    cuisine = models.CharField(max_length=100, blank=True, null=True)
    source_url = models.URLField()  # URL where the recipe was scraped from
    image_url = models.URLField(blank=True, null=True)  # Optional image URL
