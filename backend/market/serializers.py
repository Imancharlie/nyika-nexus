from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework import serializers

from accounts.serializers import PhoneField
from common.fields import ImageUrlField

from .models import Order, OrderItem, OrderRequest, Payment, Product


class ProductSerializer(serializers.ModelSerializer):
    image = ImageUrlField()
    imageUrl = serializers.URLField(source="image_url", required=False, allow_blank=True, write_only=True)
    imageFile = serializers.ImageField(source="image_file", required=False, allow_null=True, write_only=True)
    inStock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "category", "description", "price", "unit", "stock", "inStock", "image", "imageUrl",
                  "imageFile", "featured", "active"]

    def get_inStock(self, obj):
        return obj.stock > 0


class OrderItemSerializer(serializers.ModelSerializer):
    productId = serializers.IntegerField(source="product_id", read_only=True)
    unitPrice = serializers.IntegerField(source="unit_price", read_only=True)
    subtotal = serializers.IntegerField(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "productId", "name", "unitPrice", "quantity", "subtotal"]


class PaymentSerializer(serializers.ModelSerializer):
    orderId = serializers.IntegerField(source="order_id", read_only=True)
    orderCode = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    paidAt = serializers.DateTimeField(source="paid_at", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "reference", "orderId", "orderCode", "amount", "phone", "description", "status", "method",
                  "createdAt", "paidAt"]

    def get_orderCode(self, obj):
        return obj.order.code if obj.order_id else None


class OrderSerializer(serializers.ModelSerializer):
    code = serializers.CharField(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    paymentStatus = serializers.CharField(source="payment_status", read_only=True)
    deliveryLocation = serializers.CharField(source="delivery_location", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Order
        fields = ["id", "code", "status", "paymentStatus", "total", "deliveryLocation", "phone", "notes", "items",
                  "createdAt", "updatedAt"]


class CartLineSerializer(serializers.Serializer):
    productId = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=999)


class OrderCreateSerializer(serializers.Serializer):
    items = CartLineSerializer(many=True)
    deliveryLocation = serializers.CharField(max_length=200)
    phone = PhoneField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Kikapu ni tupu.")
        return items

    @transaction.atomic
    def create(self, validated):
        user = self.context["request"].user
        merged: dict[int, int] = {}
        for line in validated["items"]:
            merged[line["productId"]] = merged.get(line["productId"], 0) + line["quantity"]
        products = {p.pk: p for p in Product.objects.select_for_update().filter(pk__in=merged, active=True)}
        errors = []
        for pid, qty in merged.items():
            product = products.get(pid)
            if not product:
                errors.append(f"Bidhaa #{pid} haipatikani.")
            elif product.stock < qty:
                errors.append(f"{product.name}: zimebaki {product.stock} tu.")
        if errors:
            raise serializers.ValidationError({"items": errors})

        order = Order.objects.create(
            user=user,
            delivery_location=validated["deliveryLocation"],
            phone=validated.get("phone") or user.phone,
            notes=validated.get("notes", ""),
        )
        total = 0
        for pid, qty in merged.items():
            product = products[pid]
            OrderItem.objects.create(order=order, product=product, name=f"{product.name} {product.unit}",
                                     unit_price=product.price, quantity=qty)
            Product.objects.filter(pk=pid).update(stock=F("stock") - qty)
            total += product.price * qty
        order.total = total
        order.save(update_fields=["total"])
        return order


class OrderRequestSerializer(serializers.ModelSerializer):
    productName = serializers.CharField(source="product_name", max_length=160)
    neededBy = serializers.DateField(source="needed_by", required=False, allow_null=True)
    adminReply = serializers.CharField(source="admin_reply", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = OrderRequest
        fields = ["id", "productName", "category", "quantity", "location", "neededBy", "notes", "status",
                  "adminReply", "createdAt"]
        read_only_fields = ["status"]

    def validate_neededBy(self, value):
        if value and value < timezone.localdate():
            raise serializers.ValidationError("Chagua tarehe ya leo au ijayo.")
        return value


class PayOrderSerializer(serializers.Serializer):
    phone = PhoneField(required=False)
