from django.conf import settings
from django.db import models


class SupportTicket(models.Model):
    CATEGORIES = [
        ("akaunti", "Akaunti"),
        ("malipo", "Malipo"),
        ("oda", "Oda"),
        ("huduma", "Huduma"),
        ("nyingine", "Nyingine"),
    ]
    STATUSES = [("wazi", "Wazi"), ("imejibiwa", "Imejibiwa"), ("imefungwa", "Imefungwa")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tickets")
    subject = models.CharField(max_length=160)
    category = models.CharField(max_length=10, choices=CATEGORIES, default="nyingine")
    status = models.CharField(max_length=10, choices=STATUSES, default="wazi")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    @property
    def code(self) -> str:
        return f"MSD-{self.pk:05d}"


class TicketMessage(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    body = models.TextField(max_length=3000)
    from_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
