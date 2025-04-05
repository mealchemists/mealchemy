import os

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from dotenv import load_dotenv
from backend.apps.user.serializer import RegisterSerializer

load_dotenv()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Account Created. Please login."},
                status=status.HTTP_201_CREATED,
            )

        # Should be guaranteed that RegisterSerializer only raises one error.
        first_error = next(iter(serializer.errors.values()))

        return Response({"email": first_error}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, username=email, password=password)

        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
        )


class LogoutView(APIView):
    def post(self, request):
        if request.user.is_authenticated:
            print(request.user)
            logout(request)
            return Response(
                {"message": "Logged out successfully"}, status=status.HTTP_200_OK
            )
        return Response(
            {"message": "Not Authroized"}, status=status.HTTP_400_BAD_REQUEST
        )


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if email:
            try:
                user = User.objects.get(email=email)

                # Generate JWT token for the user after they reset their password
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)

                # You can send this token as part of the response
                response_data = {
                    "message": "Password reset email sent.",
                    "access_token": access_token,
                }
                if os.getenv("PROD", "False").lower() == "true":
                    reset_link = (
                        f"https://www.mealchemy.app/#/reset-password?token={access_token}"
                    )
                else:
                    reset_link = (
                        f"http://localhost:3000/#/reset-password?token={access_token}"
                    )

                send_mail(
                    "Mealchemy Password Reset",
                    f"Click the link to reset your password: {reset_link}",
                    os.getenv("DEFAULT_EMAIL"),
                    [email],
                    fail_silently=False,
                )

                return Response(response_data, status=200)

            except User.DoesNotExist:
                return Response({"error": "User not found."}, status=404)

        else:
            return Response({"error": "No email provided."}, status=400)


class UpdateAccountView(APIView):
    authentication_classes = [
        SessionAuthentication,
        JWTAuthentication,
    ]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if not user.is_authenticated:
            return Response(
                {"message": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED
            )

        # Get the new username and password from the request
        new_email = request.data.get("email")
        new_password = request.data.get("password")

        user.email = new_email

        # Update the password if a new one is provided
        if new_password:
            user.set_password(new_password)

        # Save the updated user information
        user.save()

        return Response(
            {"message": "Account updated successfully."}, status=status.HTTP_200_OK
        )
        
class ResetPasswordView(APIView):
    authentication_classes = [
        JWTAuthentication,
    ]
    
    def post(self, request):
        user = request.user

        if not user.is_authenticated:
            return Response(
                {"message": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED
            )
            
        if user.email:
            if not User.objects.filter(username=user.email).exists():
                return Response(
                    {"Email not assigned"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
                
        new_password = request.data.get("password")
        if new_password:
            user.set_password(new_password)

        user.save()

        return Response(
            {"message": "Account updated successfully."}, status=status.HTTP_200_OK
        )
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
            return JsonResponse(
                {"authenticated": True, "username": request.user.username, "user_id": request.user.id}
            )
        return JsonResponse({"authenticated": False})
