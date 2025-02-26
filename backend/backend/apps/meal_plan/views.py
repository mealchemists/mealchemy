from django.shortcuts import render
from rest_framework import viewsets, status, mixins, generics
from rest_framework.response import Response
from .models.meal_plan import MealPlan
from .serializers import MealPlanSerializer

class MealPlanViewSet(viewsets.ViewSet):
    def list(self, request): #/api/Recipes
        meal_plans = MealPlan.objects.all()
        serializer = MealPlanSerializer(meal_plans, many=True)
        return Response(serializer.data)
        
    def create(self, request):
        serializer = MealPlanSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, pk=None): #/api/Recipes/<str:id>
        meal_plan = MealPlan.objects.get(id=pk)
        serializer = MealPlanSerializer(meal_plan)
        return Response(serializer.data)
    
    def update(self, request, pk=None): #/api/Recipes/<str:id>
        meal_plan = MealPlan.objects.get(id=pk)
        serializer = MealPlanSerializer(instance=meal_plan, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
    def destroy(self, request, pk=None): #/api/Recipes/<str:id>
        meal_plan = MealPlan.objects.get(id=pk)
        meal_plan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
