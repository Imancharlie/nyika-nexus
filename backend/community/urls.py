from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("posts", views.PostViewSet, basename="post")
router.register("groups", views.GroupViewSet, basename="group")

urlpatterns = router.urls
