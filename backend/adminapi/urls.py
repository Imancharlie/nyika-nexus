from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("users", views.UserAdminViewSet, basename="admin-user")
router.register("orders", views.OrderAdminViewSet, basename="admin-order")
router.register("order-requests", views.OrderRequestAdminViewSet, basename="admin-order-request")
router.register("payments", views.PaymentAdminViewSet, basename="admin-payment")
router.register("products", views.ProductAdminViewSet, basename="admin-product")
router.register("packages", views.PackageAdminViewSet, basename="admin-package")
router.register("service-requests", views.ServiceRequestAdminViewSet, basename="admin-service-request")
router.register("consultations", views.ConsultationAdminViewSet, basename="admin-consultation")
router.register("experts", views.ExpertAdminViewSet, basename="admin-expert")
router.register("loans", views.LoanAdminViewSet, basename="admin-loan")
router.register("categories", views.CategoryAdminViewSet, basename="admin-category")
router.register("articles", views.ArticleAdminViewSet, basename="admin-article")
router.register("groups", views.GroupAdminViewSet, basename="admin-group")
router.register("posts", views.PostAdminViewSet, basename="admin-post")
router.register("tickets", views.TicketAdminViewSet, basename="admin-ticket")
router.register("broadcasts", views.BroadcastViewSet, basename="admin-broadcast")
router.register("sms-logs", views.SmsLogViewSet, basename="admin-sms-log")

urlpatterns = [
    path("metrics/", views.MetricsView.as_view()),
    path("regions/", views.RegionsView.as_view()),
    path("integrations/", views.IntegrationsView.as_view()),
    path("integrations/<str:kind>/", views.IntegrationDetailView.as_view()),
] + router.urls
