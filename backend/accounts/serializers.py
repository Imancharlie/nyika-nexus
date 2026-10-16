from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from common.fields import media_url

from .models import TZ_REGIONS, User
from .phone import normalize_tz_phone


class PhoneField(serializers.CharField):
    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        try:
            return normalize_tz_phone(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages[0])


class UserSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source="first_name", required=False, allow_blank=True)
    lastName = serializers.CharField(source="last_name", required=False, allow_blank=True)
    fullName = serializers.CharField(source="full_name", read_only=True)
    phoneVerified = serializers.BooleanField(source="phone_verified", read_only=True)
    isStaff = serializers.BooleanField(source="is_staff", read_only=True)
    dateJoined = serializers.DateTimeField(source="date_joined", read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "firstName", "lastName", "fullName", "phone", "phoneVerified",
                  "region", "location", "language", "avatar", "isStaff", "dateJoined"]
        read_only_fields = ["id", "username", "phone"]

    def get_avatar(self, obj):
        if obj.avatar:
            return media_url(self.context.get("request"), obj.avatar)
        return f"https://api.dicebear.com/7.x/initials/svg?seed={obj.full_name}&backgroundColor=0B7A43"


class PublicUserSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source="first_name", read_only=True)
    lastName = serializers.CharField(source="last_name", read_only=True)
    fullName = serializers.CharField(source="full_name", read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "firstName", "lastName", "fullName", "phone", "region", "location", "avatar"]

    def get_avatar(self, obj):
        return UserSerializer(context=self.context).get_avatar(obj)


class ProfileUpdateSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source="first_name", required=False, max_length=150)
    lastName = serializers.CharField(source="last_name", required=False, max_length=150)

    class Meta:
        model = User
        fields = ["firstName", "lastName", "region", "location", "language", "avatar"]

    def validate_region(self, value):
        if value and value not in TZ_REGIONS:
            raise serializers.ValidationError("Mkoa si sahihi.")
        return value


class PasswordPairMixin(serializers.Serializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    passwordConfirm = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_passwords(self, attrs, user=None):
        if attrs["password"] != attrs["passwordConfirm"]:
            raise serializers.ValidationError({"passwordConfirm": "Nenosiri halilingani."})
        try:
            password_validation.validate_password(attrs["password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})


class RegisterSerializer(PasswordPairMixin):
    username = serializers.RegexField(r"^[A-Za-z0-9_.]{3,30}$", error_messages={
        "invalid": "Jina la mtumiaji: herufi 3-30, namba, _ au . tu (bila nafasi)."})
    firstName = serializers.CharField(max_length=150)
    lastName = serializers.CharField(max_length=150)
    phone = PhoneField()
    region = serializers.ChoiceField(choices=TZ_REGIONS, required=False, allow_blank=True)
    language = serializers.ChoiceField(choices=["sw", "en"], required=False, default="sw")

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Jina hili la mtumiaji tayari limechukuliwa.")
        return value

    def validate_phone(self, value):
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Namba hii ya simu tayari imesajiliwa. Ingia badala yake.")
        return value

    def validate(self, attrs):
        probe = User(username=attrs["username"], first_name=attrs["firstName"], last_name=attrs["lastName"])
        self.validate_passwords(attrs, user=probe)
        return attrs

    def create(self, validated):
        return User.objects.create_user(
            username=validated["username"],
            first_name=validated["firstName"],
            last_name=validated["lastName"],
            phone=validated["phone"],
            region=validated.get("region", ""),
            language=validated.get("language", "sw"),
            password=validated["password"],
        )


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(trim_whitespace=False)


class PhoneSerializer(serializers.Serializer):
    phone = PhoneField()


class VerifyConfirmSerializer(serializers.Serializer):
    phone = PhoneField()
    code = serializers.RegexField(r"^\d{4,8}$")


class ResetConfirmSerializer(PasswordPairMixin):
    phone = PhoneField()
    code = serializers.RegexField(r"^\d{4,8}$")

    def validate(self, attrs):
        self.validate_passwords(attrs)
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    currentPassword = serializers.CharField(trim_whitespace=False)
    newPassword = serializers.CharField(trim_whitespace=False)

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["currentPassword"]):
            raise serializers.ValidationError({"currentPassword": "Nenosiri la sasa si sahihi."})
        try:
            password_validation.validate_password(attrs["newPassword"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"newPassword": list(exc.messages)})
        return attrs
