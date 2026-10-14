import secrets

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import AbstractUser, UserManager as BaseUserManager
from django.db import models
from django.utils import timezone

TZ_REGIONS = [
    "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi", "Kigoma",
    "Kilimanjaro", "Lindi", "Manyara", "Mara", "Mbeya", "Morogoro", "Mtwara", "Mwanza",
    "Njombe", "Pemba Kaskazini", "Pemba Kusini", "Pwani", "Rukwa", "Ruvuma", "Shinyanga",
    "Simiyu", "Singida", "Songwe", "Tabora", "Tanga", "Unguja Kaskazini", "Unguja Kusini",
    "Mjini Magharibi",
]


class UserManager(BaseUserManager):
    def _create_user(self, username, email, password, **extra_fields):
        from .phone import normalize_tz_phone

        extra_fields["phone"] = normalize_tz_phone(extra_fields.get("phone", ""))
        return super()._create_user(username, email, password, **extra_fields)

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("phone_verified", True)
        return super().create_superuser(username, email, password, **extra_fields)


class User(AbstractUser):
    objects = UserManager()

    phone = models.CharField(max_length=16, unique=True)
    phone_verified = models.BooleanField(default=False)
    region = models.CharField(max_length=40, blank=True)
    location = models.CharField(max_length=120, blank=True)
    language = models.CharField(max_length=2, choices=[("sw", "Kiswahili"), ("en", "English")], default="sw")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    REQUIRED_FIELDS = ["email", "phone"]

    @property
    def full_name(self) -> str:
        return self.get_full_name() or self.username


class PhoneOTP(models.Model):
    PURPOSE_VERIFY = "verify"
    PURPOSE_RESET = "reset"
    PURPOSES = [(PURPOSE_VERIFY, "Verify phone"), (PURPOSE_RESET, "Reset password")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otps")
    purpose = models.CharField(max_length=10, choices=PURPOSES)
    code_hash = models.CharField(max_length=128)
    attempts = models.PositiveSmallIntegerField(default=0)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @classmethod
    def issue(cls, user, purpose: str) -> str:
        cls.objects.filter(user=user, purpose=purpose, used=False).update(used=True)
        code = "".join(secrets.choice("0123456789") for _ in range(settings.OTP_LENGTH))
        cls.objects.create(
            user=user,
            purpose=purpose,
            code_hash=make_password(code),
            expires_at=timezone.now() + timezone.timedelta(minutes=settings.OTP_TTL_MINUTES),
        )
        return code

    @classmethod
    def seconds_until_resend(cls, user, purpose: str) -> int:
        last = cls.objects.filter(user=user, purpose=purpose).first()
        if not last:
            return 0
        elapsed = (timezone.now() - last.created_at).total_seconds()
        return max(0, int(settings.OTP_RESEND_SECONDS - elapsed))

    @classmethod
    def verify_code(cls, user, purpose: str, code: str) -> bool:
        otp = cls.objects.filter(user=user, purpose=purpose, used=False).first()
        if not otp or otp.expires_at < timezone.now() or otp.attempts >= settings.OTP_MAX_ATTEMPTS:
            return False
        if check_password(code.strip(), otp.code_hash):
            otp.used = True
            otp.save(update_fields=["used"])
            return True
        otp.attempts += 1
        otp.save(update_fields=["attempts"])
        return False
