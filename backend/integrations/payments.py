"""Generic payment gateway adapter.

No provider has been chosen yet. Once one is (e.g. Selcom, AzamPay, ClickPesa), adapt
`initiate()` to that provider's request format; everything else (admin settings,
webhook, Payment records) stays the same.
"""
import hmac
import logging

import requests

from .models import IntegrationSetting

logger = logging.getLogger("agrimika")


def payments_ready() -> bool:
    return IntegrationSetting.get(IntegrationSetting.KIND_PAYMENT).is_ready


def initiate(payment) -> dict:
    """Ask the gateway to collect `payment.amount` from `payment.phone`.

    Returns {"ok": bool, "provider_reference": str, "message": str}.
    """
    setting = IntegrationSetting.get(IntegrationSetting.KIND_PAYMENT)
    if not setting.is_ready:
        return {"ok": False, "provider_reference": "", "message": "not_configured"}

    url = setting.value("base_url").rstrip("/") + "/payments"
    body = {
        "merchant_id": setting.value("merchant_id"),
        "reference": payment.reference,
        "amount": int(payment.amount),
        "currency": setting.value("currency") or "TZS",
        "phone": payment.phone.lstrip("+"),
        "description": payment.description,
        "callback_url": setting.value("callback_url"),
    }
    try:
        response = requests.post(
            url, json=body, timeout=30,
            headers={"Authorization": f"Bearer {setting.value('api_key')}"},
        )
        data = response.json() if response.content else {}
    except (requests.RequestException, ValueError) as exc:
        logger.warning("Payment initiate failed: %s", exc)
        return {"ok": False, "provider_reference": "", "message": str(exc)}
    return {
        "ok": response.ok,
        "provider_reference": str(data.get("reference") or data.get("transaction_id") or ""),
        "message": str(data.get("message") or response.status_code),
    }


def verify_webhook(secret_header: str) -> bool:
    setting = IntegrationSetting.get(IntegrationSetting.KIND_PAYMENT)
    expected = setting.value("webhook_secret")
    return bool(expected) and hmac.compare_digest(expected, secret_header or "")
