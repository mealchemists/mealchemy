from django.contrib import admin
from django.urls import path
from .views import ShoppingListView

urlpatterns = [
    path('shopping-list/<str:user_id>/', ShoppingListView.as_view(), name='shopping-list'),
]
