from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from farm.models import notify

from .models import Comment, Group, GroupMembership, Post, PostLike, SavedPost
from .serializers import CommentSerializer, GroupSerializer, PostSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, "author", None) or getattr(obj, "created_by", None)
        return owner == request.user or request.user.is_staff


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    http_method_names = ["get", "post", "delete"]
    pagination_class = None

    def get_queryset(self):
        qs = Post.objects.filter(hidden=False).select_related("author").prefetch_related(
            "comments__author", "likes")
        params = self.request.query_params
        if params.get("group"):
            qs = qs.filter(group_id=params["group"])
        elif params.get("mine"):
            qs = qs.filter(author=self.request.user)
        elif params.get("saved"):
            qs = qs.filter(saves__user=self.request.user)
        elif params.get("author"):
            qs = qs.filter(author_id=params["author"])
        elif self.action == "list":
            qs = qs.filter(group__isnull=True)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        context["liked_ids"] = set(PostLike.objects.filter(user=user).values_list("post_id", flat=True))
        context["saved_ids"] = set(SavedPost.objects.filter(user=user).values_list("post_id", flat=True))
        return context

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def _toggle(self, model, request):
        post = self.get_object()
        existing = model.objects.filter(post=post, user=request.user)
        if existing.exists():
            existing.delete()
            active = False
        else:
            model.objects.create(post=post, user=request.user)
            active = True
        return post, active

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        post, liked = self._toggle(PostLike, request)
        post = self.get_queryset().get(pk=post.pk)
        if liked and post.author_id != request.user.id:
            notify(post.author, "penda", f"{request.user.full_name} amependa chapisho lako",
                   f"\"{post.text[:60]}\"", "/post")
        return Response(self.get_serializer(post).data)

    @action(detail=True, methods=["post"], url_path="save")
    def toggle_save(self, request, pk=None):
        post, _ = self._toggle(SavedPost, request)
        return Response(self.get_serializer(post).data)

    @action(detail=True, methods=["post"])
    def comments(self, request, pk=None):
        post = self.get_object()
        text = str(request.data.get("text", "")).strip()
        if not text:
            return Response({"text": ["Andika maoni kwanza."]}, status=status.HTTP_400_BAD_REQUEST)
        comment = Comment.objects.create(post=post, author=request.user, text=text[:1000])
        if post.author_id != request.user.id:
            notify(post.author, "maoni", f"{request.user.full_name} ametoa maoni", text[:120], "/post")
        return Response(CommentSerializer(comment, context=self.get_serializer_context()).data,
                        status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], url_path=r"comments/(?P<comment_id>[0-9]+)")
    def delete_comment(self, request, pk=None, comment_id=None):
        comment = Comment.objects.filter(post_id=pk, pk=comment_id).first()
        if comment is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if comment.author_id != request.user.id and not request.user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    http_method_names = ["get", "post", "patch", "delete"]
    search_fields = ["name", "description", "region", "crop"]
    filterset_fields = ["region"]
    pagination_class = None

    def get_queryset(self):
        qs = Group.objects.filter(active=True).prefetch_related("members")
        if self.request.query_params.get("mine"):
            qs = qs.filter(members=self.request.user)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["member_ids"] = set(
            GroupMembership.objects.filter(user=self.request.user).values_list("group_id", flat=True))
        return context

    def perform_create(self, serializer):
        group = serializer.save(created_by=self.request.user)
        GroupMembership.objects.create(group=group, user=self.request.user, is_admin=True)

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        group = self.get_object()
        GroupMembership.objects.get_or_create(group=group, user=request.user)
        return Response(self.get_serializer(group, context=self.get_serializer_context()).data)

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        group = self.get_object()
        GroupMembership.objects.filter(group=group, user=request.user).delete()
        return Response(self.get_serializer(group, context=self.get_serializer_context()).data)
