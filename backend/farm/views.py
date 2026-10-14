from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import (
    Article,
    Consultation,
    Expert,
    LearningCategory,
    Loan,
    Notification,
    SavedArticle,
    ServicePackage,
    ServiceRequest,
    notify,
)
from .serializers import (
    ArticleSerializer,
    ConsultationSerializer,
    ExpertSerializer,
    LearningCategorySerializer,
    LoanSerializer,
    NotificationSerializer,
    ServicePackageSerializer,
    ServiceRequestSerializer,
)


class ServicePackageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ServicePackageSerializer
    queryset = ServicePackage.objects.filter(active=True)
    pagination_class = None


class ServiceRequestViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin,
                            viewsets.GenericViewSet):
    serializer_class = ServiceRequestSerializer
    pagination_class = None

    def get_queryset(self):
        return ServiceRequest.objects.filter(user=self.request.user).select_related("package")

    def get_object(self):
        lookup = str(self.kwargs["pk"]).upper().replace("AGR-", "")
        if not lookup.isdigit():
            raise Http404
        return get_object_or_404(self.get_queryset(), pk=int(lookup))

    def perform_create(self, serializer):
        package = serializer.validated_data["package"]
        obj = serializer.save(user=self.request.user, price=package.price)
        notify(self.request.user, "huduma", "Ombi lako limepokelewa",
               f"Ombi namba {obj.code} la {package.name} limepokelewa. Tutakupigia simu kupanga tarehe.",
               "/wasifu")

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        obj = self.get_object()
        if obj.status in {"inasubiri", "imethibitishwa"}:
            obj.status = "imeghairiwa"
            obj.save(update_fields=["status"])
        return Response(self.get_serializer(obj).data)


class ExpertViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExpertSerializer
    queryset = Expert.objects.filter(active=True)
    pagination_class = None


class ConsultationViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = ConsultationSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    pagination_class = None

    def get_queryset(self):
        return Consultation.objects.filter(user=self.request.user).select_related("expert")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LearningCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LearningCategorySerializer
    queryset = LearningCategory.objects.all()
    pagination_class = None


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ArticleSerializer
    pagination_class = None
    filterset_fields = ["category"]
    search_fields = ["title", "description"]

    def get_queryset(self):
        return Article.objects.filter(published=True).select_related("category").prefetch_related("related")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["saved_ids"] = set(
            SavedArticle.objects.filter(user=self.request.user).values_list("article_id", flat=True))
        return context

    @action(detail=True, methods=["post"], url_path="save")
    def toggle_save(self, request, pk=None):
        article = self.get_object()
        existing = SavedArticle.objects.filter(user=request.user, article=article)
        if existing.exists():
            existing.delete()
            saved = False
        else:
            SavedArticle.objects.create(user=request.user, article=article)
            saved = True
        return Response({"saved": saved})


class LoanViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LoanSerializer
    queryset = Loan.objects.filter(active=True)
    pagination_class = None


class NotificationViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = NotificationSerializer
    pagination_class = None

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        Notification.objects.filter(user=request.user, pk=pk).update(read=True)
        return Response({"ok": True})

    @action(detail=False, methods=["post"], url_path="read-all")
    def read_all(self, request):
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({"ok": True})
