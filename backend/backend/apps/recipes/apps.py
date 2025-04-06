from django.apps import AppConfig
from django.db.models.signals import post_migrate

def my_callback(sender, **kwargs):
    from django.apps import apps
    Aisle = apps.get_model('recipes', 'Aisle')
    Aisle.objects.get_or_create(name="Uncategorized")

class RecipesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.apps.recipes'
    
    def ready(self):
        post_migrate.connect(my_callback, sender=self)
