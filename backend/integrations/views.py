from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .payments import payments_ready, verify_webhook
from .sms import sms_ready


class PublicConfigView(APIView):
    """Feature flags the app needs before login (e.g. whether SMS codes are in use)."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"smsEnabled": sms_ready(), "paymentsEnabled": payments_ready()})


class PaymentWebhookView(APIView):
    """Gateway calls this with {"reference": "...", "status": "paid" | "failed"}.

    The request must carry the header X-Webhook-Secret matching the secret saved in the admin page.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        if not verify_webhook(request.headers.get("X-Webhook-Secret", "")):
            return Response({"detail": "invalid signature"}, status=status.HTTP_403_FORBIDDEN)
        from market.models import Payment

        reference = str(request.data.get("reference", ""))
        new_status = str(request.data.get("status", "")).lower()
        payment = Payment.objects.filter(reference=reference).first() or \
            Payment.objects.filter(provider_reference=reference).first()
        if not payment:
            return Response({"detail": "unknown reference"}, status=status.HTTP_404_NOT_FOUND)
        if new_status in {"paid", "success", "successful", "completed"}:
            payment.mark_paid(raw=request.data)
        elif new_status in {"failed", "cancelled", "canceled"}:
            payment.mark_failed(raw=request.data)
        return Response({"ok": True})
