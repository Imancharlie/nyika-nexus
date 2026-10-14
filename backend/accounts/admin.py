from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import PhoneOTP, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "first_name", "last_name", "phone", "phone_verified", "region", "is_staff"]
    search_fields = ["username", "first_name", "last_name", "phone"]
    fieldsets = BaseUserAdmin.fieldsets + (("AGRIMIKA", {"fields": ("phone", "phone_verified", "region", "location", "language", "avatar")}),)
    add_fieldsets = BaseUserAdmin.add_fieldsets + (("AGRIMIKA", {"fields": ("phone", "first_name", "last_name")}),)


admin.site.register(PhoneOTP)
