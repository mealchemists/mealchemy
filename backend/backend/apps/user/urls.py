from django.contrib import admin
from django.urls import path
from backend.apps.user.views import (RegisterView, LogoutView, LoginView, CsrfView, CheckAuth)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('csrf-token/', CsrfView.as_view(), name='logout'),
    path('check-auth/', CheckAuth.as_view(), name='logout'),
]
