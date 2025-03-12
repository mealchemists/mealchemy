import uuid
from django.db import models
from django.contrib.auth.models import User
from backend.models import TimeStampedModel

class RecipeTag(TimeStampedModel):
    name = models.TextField(max_length=255, blank=False)

class Recipe(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=255, blank=False)
    prep_time = models.IntegerField(help_text="Preparation time in minutes")
    cook_time = models.IntegerField(help_text="Cooking time in minutes")
    total_time = models.IntegerField(help_text="Total time in minutes")
    source_url = models.URLField(blank=True)  # Source URL
    image_url = models.ImageField(upload_to="../../../../media/", default="../../../../../media/salad.jpg")
    steps = models.TextField(null=True, max_length=255)
    main_ingredient = models.TextField(null=True, max_length=255),
    is_confirmed = models.BooleanField(default=True)
    tags = models.ManyToManyField(RecipeTag, related_name="recipes", blank=True)
    

    def save(self, *args, **kwargs):
        if self.total_time is None:
            self.total_time = self.prep_time + self.cook_time
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.name}"
