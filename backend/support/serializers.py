from rest_framework import serializers

from .models import SupportTicket, TicketMessage


class TicketMessageSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.full_name", read_only=True)
    fromStaff = serializers.BooleanField(source="from_staff", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = TicketMessage
        fields = ["id", "author", "body", "fromStaff", "createdAt"]


class TicketSerializer(serializers.ModelSerializer):
    code = serializers.CharField(read_only=True)
    messages = TicketMessageSerializer(many=True, read_only=True)
    message = serializers.CharField(write_only=True, max_length=3000)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = SupportTicket
        fields = ["id", "code", "subject", "category", "status", "message", "messages", "createdAt", "updatedAt",
                  "user"]
        read_only_fields = ["status"]

    def get_user(self, obj):
        return {"id": obj.user_id, "name": obj.user.full_name, "phone": obj.user.phone}

    def create(self, validated):
        body = validated.pop("message")
        ticket = SupportTicket.objects.create(**validated)
        TicketMessage.objects.create(ticket=ticket, author=ticket.user, body=body)
        return ticket
