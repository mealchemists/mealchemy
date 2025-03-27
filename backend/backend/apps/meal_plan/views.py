from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models.meal_plan import MealPlan
from .serializers import MealPlanSerializer
from datetime import datetime


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models.meal_plan import MealPlan
from .serializers import MealPlanSerializer
from rest_framework.exceptions import NotFound


class MealPlanAPIView(APIView):
    def get(self, request, *args, **kwargs):
        """
        Optionally, retrieve meal plans by a range.
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            queryset = MealPlan.get_week_meals(request.user)
            meal_plan_serializer = MealPlanSerializer(queryset, many=True)
            return Response({"meal_plan": meal_plan_serializer.data}, status=status.HTTP_200_OK)
        else:
            try:
                start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
                end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
            except ValueError:
                return Response({"error": "Invalid date format. Please use 'YYYY-MM-DD'."}, status=status.HTTP_400_BAD_REQUEST)

            queryset = MealPlan.get_meals_for_range(start_date, end_date, user=request.user)
            meal_plan_serializer = MealPlanSerializer(queryset, many=True)
            return Response({"meal_plan": meal_plan_serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        for meal_plan_data in request.data:
            meal_plan_data["day_planned"] = datetime.strptime(meal_plan_data["day_planned"], "%Y-%m-%dT%H:%M:%S.%fZ").date()  
            meal_plan_id = meal_plan_data.get('id', None)  # Get the meal_plan ID from the request
        
            if meal_plan_id:
                # If meal_plan ID is provided, update the existing meal plan
                try:
                    meal_plan = MealPlan.objects.get(id=meal_plan_id)
                except MealPlan.DoesNotExist:
                    return Response({'detail': 'MealPlan not found.'}, status=status.HTTP_404_NOT_FOUND)
                
                # Use the serializer to update the existing meal plan
                serializer = MealPlanSerializer(meal_plan, data=meal_plan_data)  
            else:
                serializer = MealPlanSerializer(data=meal_plan_data)

            if serializer.is_valid():
                serializer.save()  
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, pk=None):
        try:
            meal_plan = MealPlan.objects.get(pk=pk)
            meal_plan.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except MealPlan.DoesNotExist:
            raise NotFound("Meal Plan not found")
        