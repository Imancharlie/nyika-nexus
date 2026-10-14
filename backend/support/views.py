from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import SupportTicket, TicketMessage
from .serializers import TicketMessageSerializer, TicketSerializer


class TicketViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin,
                    viewsets.GenericViewSet):
    serializer_class = TicketSerializer
    pagination_class = None

    def get_queryset(self):
        return SupportTicket.objects.filter(user=self.request.user).prefetch_related("messages__author")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        body = str(request.data.get("body", "")).strip()
        if not body:
            return Response({"body": ["Andika ujumbe kwanza."]}, status=status.HTTP_400_BAD_REQUEST)
        message = TicketMessage.objects.create(ticket=ticket, author=request.user, body=body[:3000])
        ticket.status = "wazi"
        ticket.save(update_fields=["status", "updated_at"])
        return Response(TicketMessageSerializer(message).data, status=status.HTTP_201_CREATED)
