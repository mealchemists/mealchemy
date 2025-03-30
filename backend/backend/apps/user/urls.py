from django.contrib import admin
from django.urls import path
from backend.apps.user.views import (RegisterView, LogoutView, LoginView, CsrfView, CheckAuth, UpdateAccountView, ForgotPasswordView)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('csrf-token/', CsrfView.as_view(), name='csrf-toke'),
    path('check-auth/', CheckAuth.as_view(), name='check-auth'),
    path('update-account/', UpdateAccountView.as_view(), name='update-account'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
