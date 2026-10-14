import re

from django.core.exceptions import ValidationError

_MOBILE = re.compile(r"^[67]\d{8}$")


def normalize_tz_phone(value: str) -> str:
    """Return a Tanzanian mobile number as +255XXXXXXXXX.

    Accepts 0712 345 678, 712345678, 255712345678 and +255 712 345 678.
    """
    digits = re.sub(r"\D", "", value or "")
    if digits.startswith("255"):
        local = digits[3:]
    elif digits.startswith("0"):
        local = digits[1:]
    else:
        local = digits
    if not _MOBILE.match(local):
        raise ValidationError("Namba ya simu si sahihi. Mfano: 0712 345 678")
    return f"+255{local}"


def try_normalize(value: str) -> str | None:
    try:
        return normalize_tz_phone(value)
    except ValidationError:
        return None


def to_beem(phone: str) -> str:
    """Beem expects 2557XXXXXXXX without the plus sign."""
    return phone.lstrip("+")
