from rest_framework import serializers

from accounts.serializers import UserSerializer
from common.fields import ImageUrlField, media_url, sw_timesince

from .models import Comment, Group, Post


def _avatar(user, context):
    return UserSerializer(context=context).get_avatar(user)


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.full_name", read_only=True)
    authorId = serializers.IntegerField(source="author_id", read_only=True)
    avatar = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "author", "authorId", "avatar", "text", "time", "createdAt"]

    def get_avatar(self, obj):
        return _avatar(obj.author, self.context)

    def get_time(self, obj):
        return sw_timesince(obj.created_at)


class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.full_name", read_only=True)
    authorId = serializers.IntegerField(source="author_id", read_only=True)
    avatar = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    image = ImageUrlField()
    imageFile = serializers.ImageField(source="image_file", write_only=True, required=False, allow_null=True)
    video = serializers.SerializerMethodField()
    videoFile = serializers.FileField(source="video_file", write_only=True, required=False, allow_null=True)
    likes = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()
    saved = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    groupId = serializers.PrimaryKeyRelatedField(source="group", queryset=Group.objects.filter(active=True),
                                                 required=False, allow_null=True)

    class Meta:
        model = Post
        fields = ["id", "author", "authorId", "avatar", "location", "time", "createdAt", "text", "image", "imageFile",
                  "video", "videoFile", "likes", "liked", "saved", "comments", "groupId"]

    def get_video(self, obj):
        return media_url(self.context.get("request"), obj.video_file) or None

    def validate_videoFile(self, value):
        if not value:
            return value
        kind = getattr(value, "content_type", "") or ""
        name = (getattr(value, "name", "") or "").lower()
        allowed = kind in {"video/mp4", "video/webm", "video/quicktime"} or name.endswith((".mp4", ".webm", ".mov"))
        if not allowed:
            raise serializers.ValidationError("Video inaruhusiwa: mp4, webm, au mov.")
        if value.size > 30 * 1024 * 1024:
            raise serializers.ValidationError("Video ni kubwa sana. Kikomo ni MB 30.")
        return value

    def get_avatar(self, obj):
        return _avatar(obj.author, self.context)

    def get_location(self, obj):
        return obj.author.region or obj.author.location or "Tanzania"

    def get_time(self, obj):
        return sw_timesince(obj.created_at)

    def get_likes(self, obj):
        return obj.seed_likes + obj.likes.count()

    def get_liked(self, obj):
        return obj.pk in self.context.get("liked_ids", set())

    def get_saved(self, obj):
        return obj.pk in self.context.get("saved_ids", set())

    def validate(self, attrs):
        group = attrs.get("group")
        user = self.context["request"].user
        if group and not group.members.filter(pk=user.pk).exists():
            raise serializers.ValidationError({"groupId": "Jiunge na kikundi kwanza ili kuchapisha."})
        return attrs


class GroupSerializer(serializers.ModelSerializer):
    image = ImageUrlField()
    imageUrl = serializers.URLField(source="image_url", required=False, allow_blank=True, write_only=True)
    membersCount = serializers.IntegerField(source="members.count", read_only=True)
    memberAvatars = serializers.SerializerMethodField()
    isMember = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Group
        fields = ["id", "name", "description", "region", "crop", "image", "imageUrl", "membersCount",
                  "memberAvatars", "isMember", "active", "createdAt"]
        read_only_fields = ["active"]

    def get_memberAvatars(self, obj):
        return [_avatar(u, self.context) for u in obj.members.all()[:4]]

    def get_isMember(self, obj):
        return obj.pk in self.context.get("member_ids", set())
