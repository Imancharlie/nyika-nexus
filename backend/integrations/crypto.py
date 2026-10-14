import base64
import hashlib
import json

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings


def _fernet() -> Fernet:
    key = settings.FIELD_ENCRYPTION_KEY
    if not key:
        key = base64.urlsafe_b64encode(hashlib.sha256(settings.SECRET_KEY.encode()).digest()).decode()
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_dict(data: dict) -> str:
    if not data:
        return ""
    return _fernet().encrypt(json.dumps(data).encode()).decode()


def decrypt_dict(token: str) -> dict:
    if not token:
        return {}
    try:
        return json.loads(_fernet().decrypt(token.encode()).decode())
    except (InvalidToken, ValueError):
        return {}


def mask(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 6:
        return "•" * len(value)
    return f"{value[:3]}{'•' * 6}{value[-3:]}"
