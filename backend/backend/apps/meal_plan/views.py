from rest_framework import viewsets
from .models.meal_plan import MealPlan
from .serializers import MealPlanSerializer
from rest_framework import viewsets, status, mixins, generics
from rest_framework.response import Response
from rest_framework.decorators import action

class MealPlanViewSet(viewsets.ModelViewSet):
    queryset = MealPlan.objects.all()
    serializer_class = MealPlanSerializer

    @action(detail=False, methods=['GET'])
    def by_week(self, request):
        """
        Returns only the meals plans for the current week. Includes serialized recipe data
        """
        queryset = MealPlan.get_week_meals()
        meal_plan_serializer = MealPlanSerializer(queryset, many=True) 
        return Response({"meal_plan": meal_plan_serializer.data}, status=status.HTTP_200_OK)


