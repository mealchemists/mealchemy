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
        serializer = MealPlanSerializer(data=request.data)
        
        if serializer.is_valid():
            meal_plan = serializer.create(validated_data=request.data)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        


# class MealPlanViewSet(viewsets.ModelViewSet):
#     queryset = MealPlan.objects.all()
#     serializer_class = MealPlanSerializer

#     @action(detail=False, methods=['GET'], url_path='by-week')
#     def by_week(self, request):
#         """
#         Returns only the meals plans for the current week. Includes serialized recipe data
#         """
#         queryset = MealPlan.get_week_meals(self.request.user)
#         meal_plan_serializer = MealPlanSerializer(queryset, many=True) 
#         return Response({"meal_plan": meal_plan_serializer.data}, status=status.HTTP_200_OK)
    
#     @action(detail=False, methods=['GET'], url_path='by-range')
#     def by_range(self, request):
#         """
#         Returns only the meal plans for a given date range. Includes serialized recipe data.
#         """
#         # Get start_date and end_date from query params
#         start_date = request.query_params.get('start_date')
#         end_date = request.query_params.get('end_date')

#         # Validate the date format
#         if not start_date or not end_date:
#             return Response({"error": "Both 'start_date' and 'end_date' are required."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             # Convert strings to date objects
#             start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
#             end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
#         except ValueError:
#             return Response({"error": "Invalid date format. Please use 'YYYY-MM-DD'."}, status=status.HTTP_400_BAD_REQUEST)

#         # Get the meals in the given range
#         queryset = MealPlan.get_meals_for_range(start_date, end_date, user=request.user)

#         # Serialize the queryset
#         meal_plan_serializer = MealPlanSerializer(queryset, many=True)

#         return Response({"meal_plan": meal_plan_serializer.data}, status=status.HTTP_200_OK)
    
#     def update(self, request, *args, **kwargs):
#         # Get the meal plan object by ID
#         instance = self.get_object()

#         # Deserialize the data and validate it
#         serializer = self.get_serializer(instance, data=request.data, partial=False)
#         if serializer.is_valid():
#             # Perform the update
#             serializer.save()

#             return Response(serializer.data)
#         else:
#             # Return validation errors
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


