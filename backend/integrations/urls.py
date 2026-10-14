from django.urls import path

from . import views

urlpatterns = [
    path("config/", views.PublicConfigView.as_view()),
    path("payments/webhook/", views.PaymentWebhookView.as_view()),
]
