from django.contrib.auth.models import User
from django.db import models

from backend.models import TimeStampedModel


class Recipe(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=255, blank=False)
    prep_time = models.IntegerField(
        help_text="Preparation time in minutes",
    )
    cook_time = models.IntegerField(help_text="Cooking time in minutes")
    total_time = models.IntegerField(help_text="Total time in minutes")
    source_url = models.URLField(blank=True)  # Source URL
    image_url = models.TextField(null=True, blank=True)
    steps = models.JSONField(default=list)
    main_ingredient = models.TextField(null=True, max_length=100)
    needs_review = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        # if we have two non-null fields, derive the missing one.
        if (
            self.prep_time is not None
            and self.total_time is not None
            and self.cook_time is None
        ):
            self.cook_time = self.total_time - self.prep_time

        elif (
            self.cook_time is not None
            and self.total_time is not None
            and self.prep_time is None
        ):
            self.prep_time = self.total_time - self.cook_time

        elif self.total_time is None:
            if self.prep_time is not None and self.cook_time is not None:
                self.total_time = self.prep_time + self.cook_time
            
            elif self.prep_time is not None:
                self.total_time = self.prep_time

            elif self.cook_time is not None:
                self.total_time = self.cook_time

        # Determine if the recipe needs review
        self.needs_review = not (self.name and self.steps and self.total_time and self.main_ingredient)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}"


class Step(TimeStampedModel):
    recipe = models.ForeignKey(
        Recipe, related_name="recipe_steps", on_delete=models.CASCADE
    )
    step_number = models.IntegerField()
    description = models.TextField(null=True, blank=True, max_length=255)
