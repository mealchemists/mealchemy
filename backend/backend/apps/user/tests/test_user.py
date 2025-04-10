from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
import os
from unittest.mock import patch


class UserAuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="test@example.com", email="test@example.com", password="password123")
        self.client = APIClient()

    def test_FR1_register_user_success(self):
        data = {
            "email": "newuser@example.com",
            "password": "newpassword123",
            "username": "newuser@example.com"
        }
        response = self.client.post("/api/register/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data)

    def test_FR1_register_user_failure(self):
        data = {"email": "", "password": ""}
        response = self.client.post("/api/register/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_FR1_user_exists(self):
        # Attempt to register a user that already exists
        data = {
            "email": "test@example.com",
            "password": "password123",
            "username": "test@example.com"
        }
        response = self.client.post("/api/register/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_FR1_no_info(self):
        data = {"email": "", "password": ""}
        response = self.client.post("/api/register/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_FR2_login_user_success(self):
        data = {"email": "test@example.com", "password": "password123"}
        response = self.client.post("/api/login/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

    def test_FR2_login_user_failure(self):
        data = {"email": "test@example.com", "password": "wrongpassword"}
        response = self.client.post("/api/login/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("backend.apps.user.views.send_mail")
    def test_FR3_forgot_password_success(self, mock_send_mail):
        response = self.client.post("/api/forgot-password/", {"email": "test@example.com"})
        self.assertEqual(response.status_code, 200)
        mock_send_mail.assert_called_once()

    def test_FR3_forgot_password_no_email(self):
        response = self.client.post("/api/forgot-password/", {})
        self.assertEqual(response.status_code, 400)

    def test_FR3_forgot_password_user_not_found(self):
        response = self.client.post("/api/forgot-password/", {"email": "notfound@example.com"})
        self.assertEqual(response.status_code, 404)
        
    def test_FR3_reset_password_success(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
        response = self.client.post("/api/reset-password/", {"password": "newpassword456"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_FR3_reset_password_unauthenticated(self):
        response = self.client.post("/api/reset-password/", {"password": "pass"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_FR4_update_account(self):
        self.client.force_login(self.user)
        data = {"email": "updated@example.com", "password": "newpassword123"}
        response = self.client.post("/api/update-account/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "updated@example.com")

    def test_FR4_update_account_unauthenticated(self):
        response = self.client.post("/api/update-account/", {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_logout_user(self):
        self.client.force_login(self.user)
        response = self.client.post("/api/logout/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_unauthenticated(self):
        response = self.client.post("/api/logout/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

