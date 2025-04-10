from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Ingredient
from .scripts.nutrition import search_fdc
import requests

@receiver(post_save, sender=Ingredient)
def fetch_nutrition_data(sender, instance, created, **kwargs):
    # Only call API when a new object is created
    if created:
        try:
            nutrition_data = search_fdc(instance.name)
            
            if not nutrition_data:
                instance.nutrients = {}
            else:
                instance.nutrients = nutrition_data
                
            # Save without triggering the signal again
            instance.save(update_fields=['nutrients'])
            
        except Exception as e:
            # Log the error but don't prevent object creation
            print(f"Error fetching nutrition data: {e}")