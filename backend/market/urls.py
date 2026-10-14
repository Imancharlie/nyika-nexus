from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("products", views.ProductViewSet, basename="product")
router.register("orders", views.OrderViewSet, basename="order")
router.register("order-requests", views.OrderRequestViewSet, basename="order-request")
router.register("payments", views.PaymentViewSet, basename="payment")

urlpatterns = router.urls
