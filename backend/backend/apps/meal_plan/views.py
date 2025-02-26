from django.shortcuts import render
from rest_framework import viewsets, status, mixins, generics
from rest_framework.response import Response
from .models.meal_plan import MealPlan
from .serializers import MealPlanSerializer

class MealPlanViewSet(viewsets.ModelViewSet):
    queryset = MealPlan.objects.all()
    serializer_class = MealPlanSerializer
