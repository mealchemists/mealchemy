from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.middleware.csrf import get_token
from django.http import JsonResponse
from backend.apps.user.serializer import RegisterSerializer
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken
import os

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
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
        if request.user.is_authenticated:
            logout(request)
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        return Response({"message": "Not Authroized"}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    print("\n\n\n\n")
    print (os.environ.get("EMAIL_USER")) 
    def post(self, request): 
        send_mail(
            "Subject here",
            "Here is the message.",
            os.getenv("DEFAULT_EMAIL"),
            ["lkosedy24@gmail.com"],
            fail_silently=False,
        )
        return Response({"message": "Email sent"}, status=status.HTTP_200_OK)

class UpdateAccountView(APIView):
    def post(self, request):
        if request.user.is_authenticated:
            user = request.user
            
            # if the username if not found just keep it the same
            new_username = request.data.get("username", user.username)
            new_password = request.data.get("password")

            # update account info and save to db
            user.username = new_username
            user.set_password(new_password)
            user.save()
            
            return Response({"message": "Account Updated"}, status=status.HTTP_200_OK)
        return Response({"message": "Not Authroized"}, status=status.HTTP_400_BAD_REQUEST)
        
class CsrfView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        response = JsonResponse({"csrf_token": get_token(request)})
        response["X-CSRFToken"] = get_token(request)  # Ensure it's set in headers
        return response

class CheckAuth(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        if request.user.is_authenticated:
            return JsonResponse({"authenticated": True, "username": request.user.username})
        return JsonResponse({"authenticated": False})
    

