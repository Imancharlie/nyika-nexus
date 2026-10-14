from django.db import transaction
from django.db.models import F
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from farm.models import notify
from integrations import payments as gateway

from .models import Order, OrderRequest, Payment, Product
from .serializers import (
    OrderCreateSerializer,
    OrderRequestSerializer,
    OrderSerializer,
    PaymentSerializer,
    PayOrderSerializer,
    ProductSerializer,
)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    queryset = Product.objects.filter(active=True)
    filterset_fields = ["category", "featured"]
    search_fields = ["name", "description"]
    pagination_class = None


class OrderViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin,
                   viewsets.GenericViewSet):
    pagination_class = None

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")

    def get_serializer_class(self):
        return OrderCreateSerializer if self.action == "create" else OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        notify(request.user, "oda", "Oda imepokelewa",
               f"Oda {order.code} ya TSh {order.total:,} imepokelewa. Lipia ili tuanze kuiandaa.", "/oda")
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status != "imepokelewa" or order.payment_status == "imelipwa":
            return Response({"detail": "Oda hii haiwezi kughairiwa tena."}, status=status.HTTP_400_BAD_REQUEST)
        order.status = "imeghairiwa"
        order.save(update_fields=["status"])
        for item in order.items.exclude(product=None):
            Product.objects.filter(pk=item.product_id).update(stock=F("stock") + item.quantity)
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        order = self.get_object()
        if order.payment_status == "imelipwa":
            return Response({"detail": "Oda hii imeshalipwa."}, status=status.HTTP_400_BAD_REQUEST)
        if order.status == "imeghairiwa":
            return Response({"detail": "Oda hii imeghairiwa."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = PayOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = Payment.objects.create(
            user=request.user, order=order, amount=order.total,
            phone=serializer.validated_data.get("phone") or order.phone,
            description=f"Oda {order.code}",
        )
        result = gateway.initiate(payment)
        payment.provider_reference = result["provider_reference"]
        payment.provider_message = result["message"][:255]
        if not result["ok"] and result["message"] != "not_configured":
            payment.status = "imeshindikana"
        payment.save()
        return Response({
            "payment": PaymentSerializer(payment).data,
            "gateway": "pending_confirmation" if result["ok"] else (
                "manual" if result["message"] == "not_configured" else "failed"),
        }, status=status.HTTP_201_CREATED)


class OrderRequestViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = OrderRequestSerializer
    pagination_class = None

    def get_queryset(self):
        return OrderRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    pagination_class = None

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).select_related("order")
