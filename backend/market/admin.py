from django.contrib import admin

from .models import Order, OrderItem, OrderRequest, Payment, Product


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "status", "payment_status", "total", "created_at"]
    inlines = [OrderItemInline]


for model in [Product, OrderRequest, Payment]:
    admin.site.register(model)
