from django.contrib import admin

from .models import Broadcast, IntegrationSetting, SmsLog


@admin.register(IntegrationSetting)
class IntegrationSettingAdmin(admin.ModelAdmin):
    list_display = ["kind", "provider", "enabled", "updated_at"]
    exclude = ["secrets_encrypted"]


@admin.register(SmsLog)
class SmsLogAdmin(admin.ModelAdmin):
    list_display = ["phone", "purpose", "status", "created_at"]
    list_filter = ["status", "purpose"]


admin.site.register(Broadcast)
