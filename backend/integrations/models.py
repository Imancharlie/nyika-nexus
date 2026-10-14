from django.conf import settings
from django.db import models

from .crypto import decrypt_dict, encrypt_dict

PROVIDER_FIELDS = {
    "sms": {
        "beem": {
            "label": "Beem Africa",
            "public": ["sender_id"],
            "secret": ["api_key", "secret_key"],
            "required": ["sender_id", "api_key", "secret_key"],
        },
    },
    "payment": {
        "generic": {
            "label": "Payment gateway (generic)",
            "public": ["provider_name", "base_url", "merchant_id", "callback_url", "currency"],
            "secret": ["api_key", "secret_key", "webhook_secret"],
            "required": ["provider_name", "base_url", "api_key"],
        },
    },
}


class IntegrationSetting(models.Model):
    KIND_SMS = "sms"
    KIND_PAYMENT = "payment"
    KINDS = [(KIND_SMS, "SMS"), (KIND_PAYMENT, "Payments")]

    kind = models.CharField(max_length=20, choices=KINDS, unique=True)
    provider = models.CharField(max_length=30)
    enabled = models.BooleanField(default=False)
    config = models.JSONField(default=dict, blank=True)
    secrets_encrypted = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    DEFAULT_PROVIDER = {KIND_SMS: "beem", KIND_PAYMENT: "generic"}

    def __str__(self):
        return f"{self.kind}:{self.provider}"

    @classmethod
    def get(cls, kind: str) -> "IntegrationSetting":
        obj, _ = cls.objects.get_or_create(kind=kind, defaults={"provider": cls.DEFAULT_PROVIDER[kind]})
        return obj

    @property
    def spec(self) -> dict:
        return PROVIDER_FIELDS[self.kind][self.provider]

    @property
    def secrets(self) -> dict:
        return decrypt_dict(self.secrets_encrypted)

    def set_secrets(self, updates: dict) -> None:
        current = self.secrets
        for key, value in updates.items():
            if key not in self.spec["secret"]:
                continue
            if value is None or value == "":
                continue
            current[key] = value
        self.secrets_encrypted = encrypt_dict(current)

    def clear_secret(self, key: str) -> None:
        current = self.secrets
        current.pop(key, None)
        self.secrets_encrypted = encrypt_dict(current)

    def value(self, key: str) -> str:
        if key in self.spec["secret"]:
            return self.secrets.get(key, "")
        return self.config.get(key, "")

    @property
    def is_configured(self) -> bool:
        return all(self.value(key) for key in self.spec["required"])

    @property
    def is_ready(self) -> bool:
        return self.enabled and self.is_configured


class Broadcast(models.Model):
    AUDIENCE_ALL = "all"
    AUDIENCE_REGION = "region"

    message = models.TextField(max_length=640)
    audience = models.CharField(max_length=10, choices=[(AUDIENCE_ALL, "All users"), (AUDIENCE_REGION, "Region")])
    region = models.CharField(max_length=40, blank=True)
    also_notify_in_app = models.BooleanField(default=True)
    recipients_count = models.PositiveIntegerField(default=0)
    sent_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=12, default="pending")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class SmsLog(models.Model):
    phone = models.CharField(max_length=16)
    message = models.TextField()
    purpose = models.CharField(max_length=20, default="general")
    status = models.CharField(max_length=12)
    provider_response = models.TextField(blank=True)
    broadcast = models.ForeignKey(Broadcast, null=True, blank=True, on_delete=models.SET_NULL, related_name="logs")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
