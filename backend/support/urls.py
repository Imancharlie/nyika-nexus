from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("support/tickets", views.TicketViewSet, basename="ticket")

urlpatterns = router.urls
