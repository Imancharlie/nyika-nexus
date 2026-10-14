from rest_framework import serializers

from accounts.models import TZ_REGIONS
from accounts.serializers import UserSerializer
from community.models import Post
from community.serializers import GroupSerializer
from farm.models import ServiceRequest
from farm.serializers import ConsultationSerializer, ServiceRequestSerializer
from integrations.crypto import mask
from integrations.models import Broadcast, IntegrationSetting, SmsLog
from market.models import Order, OrderRequest
from market.serializers import OrderRequestSerializer, OrderSerializer, PaymentSerializer


def owner(user) -> dict:
    return {"id": user.id, "name": user.full_name, "phone": user.phone, "username": user.username}


class AdminUserSerializer(UserSerializer):
    isActive = serializers.BooleanField(source="is_active")
    isStaff = serializers.BooleanField(source="is_staff")
    phoneVerified = serializers.BooleanField(source="phone_verified")
    lastLogin = serializers.DateTimeField(source="last_login", read_only=True)
    ordersCount = serializers.IntegerField(read_only=True, default=0)
    region = serializers.ChoiceField(choices=TZ_REGIONS, required=False, allow_blank=True)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ["isActive", "lastLogin", "ordersCount"]
        read_only_fields = ["id", "username", "phone"]


class AdminOrderSerializer(OrderSerializer):
    customer = serializers.SerializerMethodField()
    status = serializers.ChoiceField(choices=Order.STATUSES)

    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + ["customer"]

    def get_customer(self, obj):
        return owner(obj.user)


class AdminOrderRequestSerializer(OrderRequestSerializer):
    customer = serializers.SerializerMethodField()
    status = serializers.ChoiceField(choices=OrderRequest.STATUSES)
    adminReply = serializers.CharField(source="admin_reply", required=False, allow_blank=True)

    class Meta(OrderRequestSerializer.Meta):
        fields = OrderRequestSerializer.Meta.fields + ["customer"]
        read_only_fields = []

    def get_customer(self, obj):
        return owner(obj.user)


class AdminPaymentSerializer(PaymentSerializer):
    customer = serializers.SerializerMethodField()
    providerReference = serializers.CharField(source="provider_reference", read_only=True)
    providerMessage = serializers.CharField(source="provider_message", read_only=True)

    class Meta(PaymentSerializer.Meta):
        fields = PaymentSerializer.Meta.fields + ["customer", "providerReference", "providerMessage"]

    def get_customer(self, obj):
        return owner(obj.user)


class AdminServiceRequestSerializer(ServiceRequestSerializer):
    customer = serializers.SerializerMethodField()
    status = serializers.ChoiceField(choices=ServiceRequest.STATUSES)
    adminNotes = serializers.CharField(source="admin_notes", required=False, allow_blank=True)

    class Meta(ServiceRequestSerializer.Meta):
        fields = ServiceRequestSerializer.Meta.fields + ["customer", "adminNotes"]
        read_only_fields = ["price"]

    def get_customer(self, obj):
        return owner(obj.user)


class AdminConsultationSerializer(ConsultationSerializer):
    customer = serializers.SerializerMethodField()
    expertId = serializers.CharField(source="expert_id", read_only=True)

    class Meta(ConsultationSerializer.Meta):
        fields = ConsultationSerializer.Meta.fields + ["customer", "expertId"]

    def get_customer(self, obj):
        return owner(obj.user)


class AdminPostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    likes = serializers.SerializerMethodField()
    commentsCount = serializers.IntegerField(source="comments.count", read_only=True)
    groupName = serializers.CharField(source="group.name", read_only=True, default=None)

    class Meta:
        model = Post
        fields = ["id", "author", "text", "hidden", "likes", "commentsCount", "groupName", "createdAt"]

    def get_author(self, obj):
        return owner(obj.author)

    def get_likes(self, obj):
        return obj.seed_likes + obj.likes.count()


class AdminGroupSerializer(GroupSerializer):
    class Meta(GroupSerializer.Meta):
        read_only_fields = []


class IntegrationSerializer(serializers.Serializer):
    def to_representation(self, obj: IntegrationSetting):
        spec = obj.spec
        secrets = obj.secrets
        return {
            "kind": obj.kind,
            "provider": obj.provider,
            "providerLabel": spec["label"],
            "enabled": obj.enabled,
            "configured": obj.is_configured,
            "ready": obj.is_ready,
            "publicFields": spec["public"],
            "secretFields": spec["secret"],
            "requiredFields": spec["required"],
            "config": {key: obj.config.get(key, "") for key in spec["public"]},
            "secrets": {key: {"set": bool(secrets.get(key)), "masked": mask(secrets.get(key, ""))}
                        for key in spec["secret"]},
            "updatedAt": obj.updated_at,
        }


class IntegrationUpdateSerializer(serializers.Serializer):
    enabled = serializers.BooleanField(required=False)
    config = serializers.DictField(child=serializers.CharField(allow_blank=True), required=False)
    secrets = serializers.DictField(child=serializers.CharField(allow_blank=True), required=False)
    clearSecrets = serializers.ListField(child=serializers.CharField(), required=False)


class BroadcastSerializer(serializers.ModelSerializer):
    alsoNotifyInApp = serializers.BooleanField(source="also_notify_in_app", default=True)
    recipientsCount = serializers.IntegerField(source="recipients_count", read_only=True)
    sentCount = serializers.IntegerField(source="sent_count", read_only=True)
    failedCount = serializers.IntegerField(source="failed_count", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    createdBy = serializers.CharField(source="created_by.full_name", read_only=True, default=None)
    region = serializers.ChoiceField(choices=TZ_REGIONS, required=False, allow_blank=True)
    sendSms = serializers.BooleanField(write_only=True, default=True)

    class Meta:
        model = Broadcast
        fields = ["id", "message", "audience", "region", "alsoNotifyInApp", "sendSms", "recipientsCount",
                  "sentCount", "failedCount", "status", "createdAt", "createdBy"]
        read_only_fields = ["status"]

    def validate(self, attrs):
        if attrs.get("audience") == Broadcast.AUDIENCE_REGION and not attrs.get("region"):
            raise serializers.ValidationError({"region": "Chagua mkoa."})
        if not attrs.get("sendSms", True) and not attrs.get("also_notify_in_app", True):
            raise serializers.ValidationError({"sendSms": "Chagua angalau njia moja ya kutuma."})
        return attrs


class SmsLogSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    providerResponse = serializers.CharField(source="provider_response", read_only=True)

    class Meta:
        model = SmsLog
        fields = ["id", "phone", "message", "purpose", "status", "providerResponse", "createdAt"]
