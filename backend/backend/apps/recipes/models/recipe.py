import uuid
from django.db import models
from django.contrib.auth.models import User
from backend.models import TimeStampedModel


class Recipe(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=255, blank=False)
    recipe_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    prep_time = models.IntegerField(help_text="Preparation time in minutes")
    cook_time = models.IntegerField(help_text="Cooking time in minutes")
    total_time = models.IntegerField(help_text="Total time in minutes")
    source_url = models.URLField(blank=True)  # Source URL
    image_url = models.ImageField(null=True, blank=True)  # Optional image content
    steps = models.TextField()
    
    def save(self, *args, **kwargs):
        if self.total_time is None:
            self.total_time = self.prep_time + self.cook_time
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.name}"
