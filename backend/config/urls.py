from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "AGRIMIKA (Django admin)"

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("farm.urls")),
    path("api/", include("market.urls")),
    path("api/", include("community.urls")),
    path("api/", include("support.urls")),
    path("api/", include("integrations.urls")),
    path("api/admin/", include("adminapi.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
