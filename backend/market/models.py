import secrets

from django.conf import settings
from django.db import models
from django.utils import timezone

from farm.models import notify

PRODUCT_CATEGORIES = [
    ("mbegu", "Mbegu"),
    ("mbolea", "Mbolea"),
    ("vifaa", "Vifaa"),
    ("dawa", "Dawa"),
    ("mifugo", "Mifugo"),
]


class Product(models.Model):
    name = models.CharField(max_length=140)
    category = models.CharField(max_length=10, choices=PRODUCT_CATEGORIES)
    description = models.TextField(blank=True)
    price = models.PositiveIntegerField(help_text="TZS")
    unit = models.CharField(max_length=40, help_text="e.g. 50kg, lita 1, kipande")
    stock = models.PositiveIntegerField(default=0)
    image_url = models.URLField(max_length=500, blank=True)
    image_file = models.ImageField(upload_to="products/", blank=True, null=True)
    featured = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-featured", "name"]

    def __str__(self):
        return f"{self.name} ({self.unit})"


class Order(models.Model):
    STATUSES = [
        ("imepokelewa", "Imepokelewa"),
        ("inaandaliwa", "Inaandaliwa"),
        ("njiani", "Njiani"),
        ("imefika", "Imefika"),
        ("imeghairiwa", "Imeghairiwa"),
    ]
    PAYMENT_STATUSES = [("inasubiri", "Inasubiri"), ("imelipwa", "Imelipwa"), ("imeshindikana", "Imeshindikana")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(max_length=12, choices=STATUSES, default="imepokelewa")
    payment_status = models.CharField(max_length=14, choices=PAYMENT_STATUSES, default="inasubiri")
    total = models.PositiveIntegerField(default=0)
    delivery_location = models.CharField(max_length=200)
    phone = models.CharField(max_length=16)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def code(self) -> str:
        return f"ORD-{self.pk:06d}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, null=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=180)
    unit_price = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()

    @property
    def subtotal(self) -> int:
        return self.unit_price * self.quantity


class OrderRequest(models.Model):
    """A farmer asks for something that isn't in the shop (Omba oda)."""

    STATUSES = [
        ("mpya", "Mpya"),
        ("inashughulikiwa", "Inashughulikiwa"),
        ("imekamilika", "Imekamilika"),
        ("imekataliwa", "Imekataliwa"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="order_requests")
    product_name = models.CharField(max_length=160)
    category = models.CharField(max_length=10, choices=PRODUCT_CATEGORIES, blank=True)
    quantity = models.CharField(max_length=60)
    location = models.CharField(max_length=200)
    needed_by = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=STATUSES, default="mpya")
    admin_reply = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Payment(models.Model):
    STATUSES = [("inasubiri", "Inasubiri"), ("imelipwa", "Imelipwa"), ("imeshindikana", "Imeshindikana")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")
    order = models.ForeignKey(Order, null=True, blank=True, on_delete=models.SET_NULL, related_name="payments")
    reference = models.CharField(max_length=20, unique=True, editable=False)
    amount = models.PositiveIntegerField()
    phone = models.CharField(max_length=16)
    description = models.CharField(max_length=200)
    status = models.CharField(max_length=14, choices=STATUSES, default="inasubiri")
    method = models.CharField(max_length=20, default="mobile")
    provider_reference = models.CharField(max_length=80, blank=True)
    provider_message = models.CharField(max_length=255, blank=True)
    raw = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = "PAY-" + secrets.token_hex(4).upper()
        super().save(*args, **kwargs)

    def mark_paid(self, raw: dict | None = None, method: str | None = None):
        if self.status == "imelipwa":
            return
        self.status = "imelipwa"
        self.paid_at = timezone.now()
        if raw:
            self.raw = raw
        if method:
            self.method = method
        self.save()
        if self.order:
            self.order.payment_status = "imelipwa"
            self.order.save(update_fields=["payment_status"])
        notify(self.user, "malipo", "Malipo yamepokelewa",
               f"Tumepokea TSh {self.amount:,} kwa {self.description}. Asante!", "/lipia")

    def mark_failed(self, raw: dict | None = None):
        self.status = "imeshindikana"
        if raw:
            self.raw = raw
        self.save()
        if self.order and self.order.payment_status != "imelipwa":
            self.order.payment_status = "imeshindikana"
            self.order.save(update_fields=["payment_status"])
