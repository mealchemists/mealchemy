from django.contrib.auth import login, authenticate, logout
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.middleware.csrf import get_token
from django.http import JsonResponse
from backend.apps.user.serializer import RegisterSerializer
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


# Create your views here.
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response({"message": "Account Created Login"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

class CsrfView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        response = JsonResponse({"csrf_token": get_token(request)})
        response["X-CSRFToken"] = get_token(request)  # Ensure it's set in headers
        return response

class CheckAuth(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            print("User is authenticated")
            return JsonResponse({"authenticated": True, "username": request.user.username})
        print("Unauthorized")
        return JsonResponse({"authenticated": False})

