from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from integrations.sms import SmsNotConfigured, send_sms, sms_ready

from .models import PhoneOTP, User
from .phone import try_normalize
from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    PhoneSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    ResetConfirmSerializer,
    PublicUserSerializer,
    UserSerializer,
    VerifyConfirmSerializer,
)

OTP_MESSAGES = {
    PhoneOTP.PURPOSE_VERIFY: "AGRIMIKA: Namba yako ya uthibitisho ni {code}. Inaisha baada ya dakika 10.",
    PhoneOTP.PURPOSE_RESET: "AGRIMIKA: Namba ya kubadili nenosiri ni {code}. Usimpe mtu yeyote.",
}


def auth_payload(user, request) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user, context={"request": request}).data,
    }


def send_otp(user, purpose: str) -> int:
    """Send a fresh code unless one went out recently. Returns seconds until the next resend."""
    wait = PhoneOTP.seconds_until_resend(user, purpose)
    if wait:
        return wait
    code = PhoneOTP.issue(user, purpose)
    send_sms(user.phone, OTP_MESSAGES[purpose].format(code=code), purpose=f"otp_{purpose}")
    return PhoneOTP.seconds_until_resend(user, purpose)


def mask_phone(phone: str) -> str:
    return f"{phone[:7]}•••{phone[-3:]}"


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        if sms_ready():
            try:
                resend_in = send_otp(user, PhoneOTP.PURPOSE_VERIFY)
                return Response(
                    {"requiresVerification": True, "phone": user.phone, "phoneMasked": mask_phone(user.phone),
                     "resendIn": resend_in},
                    status=status.HTTP_201_CREATED,
                )
            except SmsNotConfigured:
                pass
        return Response(auth_payload(user, request), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["identifier"].strip()
        phone = try_normalize(identifier)
        query = Q(username__iexact=identifier)
        if phone:
            query |= Q(phone=phone)
        user = User.objects.filter(query).first()
        if not user or not user.check_password(serializer.validated_data["password"]):
            return Response({"detail": "Jina la mtumiaji/namba ya simu au nenosiri si sahihi."},
                            status=status.HTTP_400_BAD_REQUEST)
        if not user.is_active:
            return Response({"detail": "Akaunti hii imesimamishwa. Wasiliana na msaada."},
                            status=status.HTTP_403_FORBIDDEN)
        if not user.is_staff and not user.phone_verified and sms_ready():
            try:
                resend_in = send_otp(user, PhoneOTP.PURPOSE_VERIFY)
            except SmsNotConfigured:
                return Response(auth_payload(user, request))
            return Response(
                {"code": "phone_unverified", "detail": "Thibitisha namba yako ya simu kwanza.",
                 "phone": user.phone, "phoneMasked": mask_phone(user.phone), "resendIn": resend_in},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(auth_payload(user, request))


class VerifyRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp"

    def post(self, request):
        serializer = PhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(phone=serializer.validated_data["phone"], phone_verified=False).first()
        if not user:
            return Response({"detail": "Namba hii haihitaji uthibitisho."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            resend_in = send_otp(user, PhoneOTP.PURPOSE_VERIFY)
        except SmsNotConfigured as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"sent": True, "resendIn": resend_in})


class VerifyConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(phone=serializer.validated_data["phone"]).first()
        if not user or not PhoneOTP.verify_code(user, PhoneOTP.PURPOSE_VERIFY, serializer.validated_data["code"]):
            return Response({"detail": "Namba ya uthibitisho si sahihi au imekwisha muda."},
                            status=status.HTTP_400_BAD_REQUEST)
        user.phone_verified = True
        user.save(update_fields=["phone_verified"])
        return Response(auth_payload(user, request))


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp"

    def post(self, request):
        if not sms_ready():
            return Response({"detail": "Huduma ya SMS haipatikani kwa sasa. Wasiliana na msaada."},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)
        serializer = PhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]
        user = User.objects.filter(phone=phone, is_active=True).first()
        resend_in = 0
        if user:
            try:
                resend_in = send_otp(user, PhoneOTP.PURPOSE_RESET)
            except SmsNotConfigured as exc:
                return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"sent": True, "phone": phone, "phoneMasked": mask_phone(phone), "resendIn": resend_in})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = User.objects.filter(phone=data["phone"], is_active=True).first()
        if not user or not PhoneOTP.verify_code(user, PhoneOTP.PURPOSE_RESET, data["code"]):
            return Response({"detail": "Namba ya uthibitisho si sahihi au imekwisha muda."},
                            status=status.HTTP_400_BAD_REQUEST)
        user.set_password(data["password"])
        user.phone_verified = True
        user.save(update_fields=["password", "phone_verified"])
        return Response(auth_payload(user, request))


class PublicUserView(APIView):
    def get(self, request, pk):
        user = User.objects.filter(pk=pk, is_active=True).first()
        if not user:
            return Response({"detail": "Mtumiaji hajapatikana."}, status=status.HTTP_404_NOT_FOUND)
        return Response(PublicUserSerializer(user, context={"request": request}).data)


class MeView(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={"request": request}).data)


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["newPassword"])
        request.user.save(update_fields=["password"])
        return Response(auth_payload(request.user, request))
