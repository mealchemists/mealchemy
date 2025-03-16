from django.contrib import admin
from django.urls import path
from backend.apps.user.views import (RegisterView, LogoutView, LoginView, CsrfView, CheckAuth, UpdateAccountView, ForgotPasswordView)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('csrf-token/', CsrfView.as_view(), name='csrf-toke'),
    path('check-auth/', CheckAuth.as_view(), name='check-auth'),
    path('update-account/', UpdateAccountView.as_view(), name='update-account'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
]
