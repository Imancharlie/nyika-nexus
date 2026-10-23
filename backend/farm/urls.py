from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views
from .advisor import AdvisorMessageView, AdvisorResetView, AdvisorSessionView

router = DefaultRouter(trailing_slash=True)
router.register("packages", views.ServicePackageViewSet, basename="package")
router.register("service-requests", views.ServiceRequestViewSet, basename="service-request")
router.register("experts", views.ExpertViewSet, basename="expert")
router.register("consultations", views.ConsultationViewSet, basename="consultation")
router.register("learning/categories", views.LearningCategoryViewSet, basename="learning-category")
router.register("learning/articles", views.ArticleViewSet, basename="article")
router.register("loans", views.LoanViewSet, basename="loan")
router.register("notifications", views.NotificationViewSet, basename="notification")

urlpatterns = [
    path("advisor/", AdvisorSessionView.as_view()),
    path("advisor/messages/", AdvisorMessageView.as_view()),
    path("advisor/reset/", AdvisorResetView.as_view()),
] + router.urls
