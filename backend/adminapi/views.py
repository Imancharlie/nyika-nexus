from datetime import timedelta

from django.db.models import Count, F, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import TZ_REGIONS, User
from common.fields import IsStaff
from community.models import Group, Post
from farm.models import (
    Article,
    Consultation,
    Expert,
    LearningCategory,
    Loan,
    Notification,
    ServicePackage,
    ServiceRequest,
    notify,
)
from farm.serializers import (
    ArticleSerializer,
    ExpertSerializer,
    LearningCategorySerializer,
    LoanSerializer,
    ServicePackageSerializer,
)
from integrations.models import Broadcast, IntegrationSetting, SmsLog
from integrations.sms import SmsNotConfigured, send_broadcast_async, send_sms
from market.models import Order, OrderItem, OrderRequest, Payment, Product
from market.serializers import ProductSerializer
from support.models import SupportTicket, TicketMessage
from support.serializers import TicketMessageSerializer, TicketSerializer

from .serializers import (
    AdminConsultationSerializer,
    AdminGroupSerializer,
    AdminOrderRequestSerializer,
    AdminOrderSerializer,
    AdminPaymentSerializer,
    AdminPostSerializer,
    AdminServiceRequestSerializer,
    AdminUserSerializer,
    BroadcastSerializer,
    IntegrationSerializer,
    IntegrationUpdateSerializer,
    SmsLogSerializer,
)


class StaffMixin:
    permission_classes = [IsStaff]


def _daily(queryset, date_field: str, days: int, value=None) -> list[dict]:
    start = timezone.localdate() - timedelta(days=days - 1)
    rows = (queryset.filter(**{f"{date_field}__date__gte": start})
            .annotate(day=TruncDate(date_field)).values("day")
            .annotate(v=value or Count("id")).order_by("day"))
    by_day = {row["day"]: row["v"] or 0 for row in rows}
    return [{"date": (start + timedelta(days=i)).isoformat(), "value": by_day.get(start + timedelta(days=i), 0)}
            for i in range(days)]


class MetricsView(StaffMixin, APIView):
    def get(self, request):
        now = timezone.now()
        farmers = User.objects.filter(is_staff=False)
        paid = Payment.objects.filter(status="imelipwa")
        return Response({
            "totals": {
                "users": farmers.count(),
                "usersVerified": farmers.filter(phone_verified=True).count(),
                "newUsers7d": farmers.filter(date_joined__gte=now - timedelta(days=7)).count(),
                "activeUsers30d": farmers.filter(last_login__gte=now - timedelta(days=30)).count(),
                "orders": Order.objects.count(),
                "ordersOpen": Order.objects.exclude(status__in=["imefika", "imeghairiwa"]).count(),
                "revenue": paid.aggregate(s=Sum("amount"))["s"] or 0,
                "revenue30d": paid.filter(paid_at__gte=now - timedelta(days=30)).aggregate(s=Sum("amount"))["s"] or 0,
                "paymentsPending": Payment.objects.filter(status="inasubiri").count(),
                "orderRequestsNew": OrderRequest.objects.filter(status="mpya").count(),
                "serviceRequestsPending": ServiceRequest.objects.filter(status="inasubiri").count(),
                "consultationsUnanswered": Consultation.objects.filter(reply="").count(),
                "ticketsOpen": SupportTicket.objects.filter(status="wazi").count(),
                "posts": Post.objects.count(),
                "groups": Group.objects.filter(active=True).count(),
                "products": Product.objects.filter(active=True).count(),
                "lowStock": Product.objects.filter(active=True, stock__lte=5).count(),
            },
            "signups": _daily(farmers, "date_joined", 30),
            "revenueDaily": _daily(paid, "paid_at", 30, Sum("amount")),
            "ordersDaily": _daily(Order.objects.all(), "created_at", 30),
            "ordersByStatus": list(Order.objects.values("status").annotate(count=Count("id")).order_by("-count")),
            "usersByRegion": list(farmers.exclude(region="").values("region").annotate(count=Count("id"))
                                  .order_by("-count")[:10]),
            "topProducts": list(OrderItem.objects.exclude(order__status="imeghairiwa").values("name")
                                .annotate(units=Sum("quantity"), revenue=Sum(F("unit_price") * F("quantity")))
                                .order_by("-units")[:5]),
            "sms": {
                "ready": IntegrationSetting.get("sms").is_ready,
                "sent30d": SmsLog.objects.filter(status="sent", created_at__gte=now - timedelta(days=30)).count(),
                "failed30d": SmsLog.objects.filter(status="failed", created_at__gte=now - timedelta(days=30)).count(),
            },
            "paymentsReady": IntegrationSetting.get("payment").is_ready,
        })


class RegionsView(StaffMixin, APIView):
    def get(self, request):
        return Response(TZ_REGIONS)


class UserAdminViewSet(StaffMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                       viewsets.GenericViewSet):
    serializer_class = AdminUserSerializer
    search_fields = ["username", "first_name", "last_name", "phone"]
    filterset_fields = ["is_active", "is_staff", "phone_verified", "region"]
    ordering_fields = ["date_joined", "last_login", "username"]
    http_method_names = ["get", "patch"]

    def get_queryset(self):
        return User.objects.annotate(ordersCount=Count("orders")).order_by("-date_joined")

    def perform_update(self, serializer):
        if serializer.instance == self.request.user and (
                serializer.validated_data.get("is_staff") is False or serializer.validated_data.get("is_active") is False):
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Huwezi kujiondolea ruhusa zako mwenyewe."})
        serializer.save()


class OrderAdminViewSet(StaffMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                        viewsets.GenericViewSet):
    serializer_class = AdminOrderSerializer
    filterset_fields = ["status", "payment_status"]
    search_fields = ["user__first_name", "user__last_name", "user__phone", "delivery_location"]
    http_method_names = ["get", "patch", "post"]

    def get_queryset(self):
        return Order.objects.select_related("user").prefetch_related("items")

    def perform_update(self, serializer):
        before = serializer.instance.status
        order = serializer.save()
        if order.status != before:
            label = dict(Order.STATUSES)[order.status]
            notify(order.user, "oda", f"Oda {order.code}: {label}", f"Hali ya oda yako sasa ni: {label}.", "/oda")

    @action(detail=True, methods=["post"], url_path="mark-paid")
    def mark_paid(self, request, pk=None):
        order = self.get_object()
        payment = order.payments.filter(status="inasubiri").first() or Payment.objects.create(
            user=order.user, order=order, amount=order.total, phone=order.phone,
            description=f"Oda {order.code}", method="manual")
        payment.mark_paid(method="manual")
        order.refresh_from_db()
        return Response(self.get_serializer(order).data)


class OrderRequestAdminViewSet(StaffMixin, mixins.ListModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = AdminOrderRequestSerializer
    filterset_fields = ["status", "category"]
    search_fields = ["product_name", "user__phone", "location"]
    http_method_names = ["get", "patch"]

    def get_queryset(self):
        return OrderRequest.objects.select_related("user")

    def perform_update(self, serializer):
        before = (serializer.instance.status, serializer.instance.admin_reply)
        obj = serializer.save()
        if (obj.status, obj.admin_reply) != before:
            body = obj.admin_reply or f"Hali ya ombi lako sasa ni: {dict(OrderRequest.STATUSES)[obj.status]}."
            notify(obj.user, "oda", f"Ombi la {obj.product_name}", body, "/omba-oda")


class PaymentAdminViewSet(StaffMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = AdminPaymentSerializer
    filterset_fields = ["status", "method"]
    search_fields = ["reference", "provider_reference", "phone", "user__first_name", "user__last_name"]

    def get_queryset(self):
        return Payment.objects.select_related("user", "order")

    @action(detail=True, methods=["post"], url_path="mark-paid")
    def mark_paid(self, request, pk=None):
        payment = self.get_object()
        payment.mark_paid(method="manual")
        return Response(self.get_serializer(payment).data)

    @action(detail=True, methods=["post"], url_path="mark-failed")
    def mark_failed(self, request, pk=None):
        payment = self.get_object()
        payment.mark_failed()
        return Response(self.get_serializer(payment).data)


class _ContentViewSet(StaffMixin, viewsets.ModelViewSet):
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    pagination_class = None


class ProductAdminViewSet(_ContentViewSet):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    filterset_fields = ["category", "active"]
    search_fields = ["name"]


class PackageAdminViewSet(_ContentViewSet):
    serializer_class = ServicePackageSerializer
    queryset = ServicePackage.objects.all()


class ExpertAdminViewSet(_ContentViewSet):
    serializer_class = ExpertSerializer
    queryset = Expert.objects.all()


class LoanAdminViewSet(_ContentViewSet):
    serializer_class = LoanSerializer
    queryset = Loan.objects.all()


class CategoryAdminViewSet(_ContentViewSet):
    serializer_class = LearningCategorySerializer
    queryset = LearningCategory.objects.all()


class ArticleAdminViewSet(_ContentViewSet):
    serializer_class = ArticleSerializer
    queryset = Article.objects.all().select_related("category").prefetch_related("related")

    def perform_create(self, serializer):
        article = serializer.save()
        Notification.objects.bulk_create([
            Notification(user=user, type="mafunzo", title=f"Makala mpya: {article.title}",
                         body=article.description[:140], link=f"/jifunze/{article.pk}")
            for user in User.objects.filter(is_active=True, is_staff=False).only("id")
        ])


class GroupAdminViewSet(_ContentViewSet):
    serializer_class = AdminGroupSerializer
    queryset = Group.objects.all().prefetch_related("members")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ServiceRequestAdminViewSet(StaffMixin, mixins.ListModelMixin, mixins.UpdateModelMixin,
                                 viewsets.GenericViewSet):
    serializer_class = AdminServiceRequestSerializer
    filterset_fields = ["status", "package"]
    search_fields = ["user__phone", "user__first_name", "location", "crop_type"]
    http_method_names = ["get", "patch"]

    def get_queryset(self):
        return ServiceRequest.objects.select_related("user", "package")

    def perform_update(self, serializer):
        before = serializer.instance.status
        obj = serializer.save()
        if obj.status != before:
            label = dict(ServiceRequest.STATUSES)[obj.status]
            notify(obj.user, "huduma", f"Ombi {obj.code}: {label}",
                   f"Ombi lako la {obj.package.name} sasa: {label}.", "/wasifu")


class ConsultationAdminViewSet(StaffMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = AdminConsultationSerializer

    def get_queryset(self):
        qs = Consultation.objects.select_related("user", "expert")
        state = self.request.query_params.get("state")
        if state == "unanswered":
            qs = qs.filter(reply="")
        elif state == "answered":
            qs = qs.exclude(reply="")
        return qs

    @action(detail=True, methods=["post"])
    def reply(self, request, pk=None):
        consultation = self.get_object()
        text = str(request.data.get("reply", "")).strip()
        if not text:
            return Response({"reply": ["Andika jibu kwanza."]}, status=status.HTTP_400_BAD_REQUEST)
        expert_id = request.data.get("expertId")
        consultation.expert = Expert.objects.filter(pk=expert_id).first() if expert_id else consultation.expert
        consultation.reply = text
        consultation.replied_at = timezone.now()
        consultation.save()
        who = consultation.expert.name if consultation.expert else "Mtaalamu wa AGRIMIKA"
        notify(consultation.user, "ushauri", f"Ushauri kutoka kwa {who}", text[:140], "/ushauri")
        return Response(self.get_serializer(consultation).data)


class TicketAdminViewSet(StaffMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                         viewsets.GenericViewSet):
    serializer_class = TicketSerializer
    filterset_fields = ["status", "category"]
    search_fields = ["subject", "user__phone", "user__first_name", "user__last_name"]
    http_method_names = ["get", "patch", "post"]

    def get_queryset(self):
        return SupportTicket.objects.select_related("user").prefetch_related("messages__author")

    def partial_update(self, request, *args, **kwargs):
        ticket = self.get_object()
        new_status = request.data.get("status")
        if new_status not in dict(SupportTicket.STATUSES):
            return Response({"status": ["Hali si sahihi."]}, status=status.HTTP_400_BAD_REQUEST)
        ticket.status = new_status
        ticket.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(ticket).data)

    @action(detail=True, methods=["post"])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        body = str(request.data.get("body", "")).strip()
        if not body:
            return Response({"body": ["Andika jibu kwanza."]}, status=status.HTTP_400_BAD_REQUEST)
        message = TicketMessage.objects.create(ticket=ticket, author=request.user, body=body[:3000], from_staff=True)
        ticket.status = "imejibiwa"
        ticket.save(update_fields=["status", "updated_at"])
        notify(ticket.user, "msaada", f"Jibu: {ticket.subject}", body[:140], f"/msaada/{ticket.pk}")
        return Response(TicketMessageSerializer(message).data, status=status.HTTP_201_CREATED)


class PostAdminViewSet(StaffMixin, mixins.ListModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin,
                       viewsets.GenericViewSet):
    serializer_class = AdminPostSerializer
    filterset_fields = ["hidden"]
    search_fields = ["text", "author__phone", "author__first_name"]
    http_method_names = ["get", "patch", "delete"]

    def get_queryset(self):
        return Post.objects.select_related("author", "group").prefetch_related("likes", "comments")


class IntegrationsView(StaffMixin, APIView):
    def get(self, request):
        return Response([IntegrationSerializer(IntegrationSetting.get(kind)).data
                         for kind, _ in IntegrationSetting.KINDS])


class IntegrationDetailView(StaffMixin, APIView):
    def _get(self, kind):
        if kind not in dict(IntegrationSetting.KINDS):
            return None
        return IntegrationSetting.get(kind)

    def put(self, request, kind):
        setting = self._get(kind)
        if not setting:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = IntegrationUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if "config" in data:
            setting.config = {**setting.config, **{k: v.strip() for k, v in data["config"].items()
                                                   if k in setting.spec["public"]}}
        if "secrets" in data:
            setting.set_secrets({k: v.strip() for k, v in data["secrets"].items()})
        for key in data.get("clearSecrets", []):
            setting.clear_secret(key)
        if "enabled" in data:
            if data["enabled"] and not setting.is_configured:
                return Response({"detail": "Jaza sehemu zote zinazohitajika kabla ya kuwasha."},
                                status=status.HTTP_400_BAD_REQUEST)
            setting.enabled = data["enabled"]
        setting.updated_by = request.user
        setting.save()
        return Response(IntegrationSerializer(setting).data)

    def post(self, request, kind):
        """Send a test: SMS to the given phone, or a configuration check for payments."""
        setting = self._get(kind)
        if not setting:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if not setting.is_configured:
            return Response({"ok": False, "detail": "Jaza sehemu zote zinazohitajika kwanza."},
                            status=status.HTTP_400_BAD_REQUEST)
        if kind == IntegrationSetting.KIND_PAYMENT:
            return Response({"ok": True, "detail": "Mipangilio imekamilika. Jaribu malipo halisi ili kuthibitisha."})
        if kind == IntegrationSetting.KIND_AI:
            from farm.advisor import ping
            ok, detail = ping()
            return Response({"ok": ok, "detail": detail}, status=status.HTTP_200_OK if ok else status.HTTP_400_BAD_REQUEST)

        from accounts.serializers import PhoneField
        from rest_framework.exceptions import ValidationError

        try:
            phone = PhoneField().run_validation(request.data.get("phone") or request.user.phone)
        except ValidationError as exc:
            return Response({"ok": False, "detail": exc.detail[0] if isinstance(exc.detail, list) else exc.detail},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            sent, _ = send_sms(phone, "AGRIMIKA: Huu ni ujumbe wa majaribio. SMS inafanya kazi!", purpose="test",
                               require_enabled=False)
        except SmsNotConfigured as exc:
            return Response({"ok": False, "detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        last = SmsLog.objects.filter(phone=phone, purpose="test").first()
        return Response({"ok": bool(sent), "detail": last.provider_response if last else ""})


class BroadcastViewSet(StaffMixin, mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = BroadcastSerializer
    queryset = Broadcast.objects.select_related("created_by")

    def _audience(self, audience, region):
        users = User.objects.filter(is_active=True, is_staff=False)
        if audience == Broadcast.AUDIENCE_REGION:
            users = users.filter(region=region)
        return users

    @action(detail=False, methods=["get"], url_path="audience-count")
    def audience_count(self, request):
        users = self._audience(request.query_params.get("audience", "all"), request.query_params.get("region", ""))
        return Response({"count": users.count(), "smsReady": IntegrationSetting.get("sms").is_ready})

    def perform_create(self, serializer):
        send_sms_flag = serializer.validated_data.pop("sendSms", True)
        if send_sms_flag and not IntegrationSetting.get("sms").is_ready:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"sendSms": "SMS haijawashwa. Weka API key ya Beem kwenye Integrations."})
        data = serializer.validated_data
        users = list(self._audience(data["audience"], data.get("region", "")).only("id", "phone"))
        broadcast = serializer.save(created_by=self.request.user, recipients_count=len(users),
                                    status="sending" if send_sms_flag else "sent")
        if broadcast.also_notify_in_app:
            Notification.objects.bulk_create([
                Notification(user=u, type="tangazo", title="Tangazo la AGRIMIKA", body=broadcast.message)
                for u in users
            ])
        if send_sms_flag and users:
            send_broadcast_async(broadcast, [u.phone for u in users])
        elif send_sms_flag:
            broadcast.status = "sent"
            broadcast.save(update_fields=["status"])


class SmsLogViewSet(StaffMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = SmsLogSerializer
    queryset = SmsLog.objects.all()
    filterset_fields = ["status", "purpose"]
    search_fields = ["phone", "message"]
