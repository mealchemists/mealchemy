from rest_framework import viewsets
from .models.meal_plan import MealPlan
from .serializers import MealPlanSerializer

class MealPlanViewSet(viewsets.ModelViewSet):
    queryset = MealPlan.objects.all()
    serializer_class = MealPlanSerializer
