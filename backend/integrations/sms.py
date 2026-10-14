import logging
import re
import threading

import requests
from django.db import close_old_connections

from accounts.phone import to_beem

from .models import Broadcast, IntegrationSetting, SmsLog

logger = logging.getLogger("agrimika")

BEEM_SEND_URL = "https://apisms.beem.africa/v1/send"
BEEM_BATCH = 100


class SmsNotConfigured(Exception):
    pass


def sms_ready() -> bool:
    return IntegrationSetting.get(IntegrationSetting.KIND_SMS).is_ready


def _beem_send(setting: IntegrationSetting, phones: list[str], message: str) -> tuple[bool, str]:
    payload = {
        "source_addr": setting.value("sender_id"),
        "schedule_time": "",
        "encoding": 0,
        "message": message,
        "recipients": [{"recipient_id": i + 1, "dest_addr": to_beem(p)} for i, p in enumerate(phones)],
    }
    try:
        response = requests.post(
            BEEM_SEND_URL,
            json=payload,
            auth=(setting.value("api_key"), setting.value("secret_key")),
            timeout=20,
        )
    except requests.RequestException as exc:
        return False, str(exc)
    try:
        data = response.json()
    except ValueError:
        data = {}
    ok = response.status_code == 200 and data.get("successful", True) is not False
    return ok, response.text[:1000]


def send_sms(phones: list[str] | str, message: str, purpose: str = "general", broadcast: Broadcast | None = None,
             require_enabled: bool = True) -> tuple[int, int]:
    """Send one message to many numbers. Returns (sent, failed)."""
    if isinstance(phones, str):
        phones = [phones]
    setting = IntegrationSetting.get(IntegrationSetting.KIND_SMS)
    if not setting.is_configured or (require_enabled and not setting.enabled):
        raise SmsNotConfigured("SMS haijawekwa. Weka API key ya Beem kwenye ukurasa wa admin.")

    logged_message = re.sub(r"\d{4,8}", "••••••", message) if purpose.startswith("otp") else message
    sent = failed = 0
    for start in range(0, len(phones), BEEM_BATCH):
        batch = phones[start:start + BEEM_BATCH]
        ok, raw = _beem_send(setting, batch, message)
        SmsLog.objects.bulk_create([
            SmsLog(phone=p, message=logged_message, purpose=purpose, status="sent" if ok else "failed",
                   provider_response=raw, broadcast=broadcast)
            for p in batch
        ])
        if ok:
            sent += len(batch)
        else:
            failed += len(batch)
            logger.warning("Beem SMS failed: %s", raw)
    return sent, failed


def send_broadcast_async(broadcast: Broadcast, phones: list[str]) -> None:
    def run():
        close_old_connections()
        try:
            sent, failed = send_sms(phones, broadcast.message, purpose="broadcast", broadcast=broadcast)
            broadcast.sent_count, broadcast.failed_count = sent, failed
            broadcast.status = "sent" if failed == 0 else ("partial" if sent else "failed")
        except SmsNotConfigured:
            broadcast.status = "failed"
            broadcast.failed_count = len(phones)
        broadcast.save(update_fields=["sent_count", "failed_count", "status"])
        close_old_connections()

    threading.Thread(target=run, daemon=True).start()
