from django.utils import timezone
from rest_framework import serializers

from common.fields import ImageUrlField, media_url, sw_timesince

from .models import Article, Consultation, Expert, LearningCategory, Loan, Notification, ServicePackage, ServiceRequest


class ServicePackageSerializer(serializers.ModelSerializer):
    serviceType = serializers.CharField(source="service_type")
    serviceArea = serializers.CharField(source="service_area")
    image = ImageUrlField()
    imageUrl = serializers.URLField(source="image_url", required=False, allow_blank=True, write_only=True)
    imageFile = serializers.ImageField(source="image_file", required=False, allow_null=True, write_only=True)
    sortOrder = serializers.IntegerField(source="sort_order", required=False)

    class Meta:
        model = ServicePackage
        fields = ["id", "name", "description", "serviceType", "coverage", "price", "duration", "includes",
                  "benefits", "requirements", "serviceArea", "featured", "image", "imageUrl", "imageFile",
                  "active", "sortOrder"]


class ServiceRequestSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    pk = serializers.IntegerField(source="id", read_only=True)
    packageId = serializers.PrimaryKeyRelatedField(source="package", queryset=ServicePackage.objects.filter(active=True))
    packageName = serializers.CharField(source="package.name", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    preferredDate = serializers.DateField(source="preferred_date")
    farmLocation = serializers.CharField(source="farm_location")
    farmSize = serializers.CharField(source="farm_size")
    cropType = serializers.CharField(source="crop_type")

    class Meta:
        model = ServiceRequest
        fields = ["id", "pk", "packageId", "packageName", "price", "status", "createdAt", "preferredDate",
                  "location", "farmLocation", "farmSize", "cropType", "notes"]
        read_only_fields = ["price", "status"]

    def validate_preferredDate(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError("Chagua tarehe ya leo au ijayo.")
        return value


class ExpertSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    avatarUrl = serializers.URLField(source="avatar_url", required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Expert
        fields = ["id", "name", "title", "specialties", "experience", "location", "availability", "phone", "bio",
                  "avatar", "avatarUrl"]

    def get_avatar(self, obj):
        return media_url(self.context.get("request"), obj.avatar_file, obj.avatar_url) or \
            f"https://api.dicebear.com/7.x/initials/svg?seed={obj.name}&backgroundColor=0B7A43"


class ConsultationSerializer(serializers.ModelSerializer):
    cropType = serializers.CharField(source="crop_type")
    image = serializers.SerializerMethodField()
    imageFile = serializers.ImageField(source="image_file", write_only=True, required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    status = serializers.CharField(read_only=True)
    expertName = serializers.CharField(source="expert.name", read_only=True, default=None)
    reply = serializers.CharField(read_only=True)

    class Meta:
        model = Consultation
        fields = ["id", "problem", "cropType", "image", "imageFile", "createdAt", "status", "expertName", "reply"]

    def get_image(self, obj):
        return media_url(self.context.get("request"), obj.image_file) or None


class LearningCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningCategory
        fields = ["id", "name", "emoji"]


class ArticleSerializer(serializers.ModelSerializer):
    categoryId = serializers.PrimaryKeyRelatedField(source="category", queryset=LearningCategory.objects.all())
    readTime = serializers.IntegerField(source="read_time")
    expertTip = serializers.CharField(source="expert_tip", required=False, allow_blank=True)
    relatedIds = serializers.PrimaryKeyRelatedField(source="related", many=True, queryset=Article.objects.all(),
                                                    required=False)
    image = ImageUrlField()
    imageUrl = serializers.URLField(source="image_url", required=False, allow_blank=True, write_only=True)
    saved = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ["id", "title", "categoryId", "description", "readTime", "image", "imageUrl", "author", "sections",
                  "actions", "expertTip", "relatedIds", "saved"]

    def get_saved(self, obj):
        saved_ids = self.context.get("saved_ids")
        return obj.pk in saved_ids if saved_ids is not None else False


class LoanSerializer(serializers.ModelSerializer):
    loanType = serializers.CharField(source="loan_type")
    howToApply = serializers.CharField(source="how_to_apply")

    class Meta:
        model = Loan
        fields = ["id", "institution", "loanType", "amount", "requirements", "repayment", "howToApply", "cta"]


class NotificationSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "type", "title", "body", "link", "time", "createdAt", "read"]

    def get_time(self, obj):
        return sw_timesince(obj.created_at)
