from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view()),
    path("login/", views.LoginView.as_view()),
    path("refresh/", TokenRefreshView.as_view()),
    path("me/", views.MeView.as_view()),
    path("users/<int:pk>/", views.PublicUserView.as_view()),
    path("change-password/", views.ChangePasswordView.as_view()),
    path("verify/request/", views.VerifyRequestView.as_view()),
    path("verify/confirm/", views.VerifyConfirmView.as_view()),
    path("password-reset/request/", views.PasswordResetRequestView.as_view()),
    path("password-reset/confirm/", views.PasswordResetConfirmView.as_view()),
]
