from django.utils import timezone
from rest_framework import permissions, serializers


def media_url(request, file_field, fallback: str = "") -> str:
    # Root-relative so photos load through the app, including on a phone.
    if file_field:
        return file_field.url
    return fallback or ""


class ImageUrlField(serializers.Field):
    """Reads `<name>_file` (upload) first, then `<name>_url` (external link)."""

    def __init__(self, base: str = "image", **kwargs):
        self.base = base
        kwargs["source"] = "*"
        kwargs["read_only"] = True
        super().__init__(**kwargs)

    def to_representation(self, obj):
        return media_url(self.context.get("request"), getattr(obj, f"{self.base}_file", None),
                         getattr(obj, f"{self.base}_url", "")) or None


def sw_timesince(value) -> str:
    seconds = int((timezone.now() - value).total_seconds())
    if seconds < 60:
        return "sasa hivi"
    minutes = seconds // 60
    if minutes < 60:
        return f"dakika {minutes} zilizopita"
    hours = minutes // 60
    if hours < 24:
        return "saa 1 iliyopita" if hours == 1 else f"saa {hours} zilizopita"
    days = hours // 24
    if days == 1:
        return "jana"
    if days < 7:
        return f"siku {days} zilizopita"
    weeks = days // 7
    if weeks < 5:
        return "wiki 1 iliyopita" if weeks == 1 else f"wiki {weeks} zilizopita"
    return value.strftime("%d/%m/%Y")


class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class ReadOnlyOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_staff)
