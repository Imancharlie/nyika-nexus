from django.conf import settings
from django.db import models


class Group(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    region = models.CharField(max_length=40, blank=True)
    crop = models.CharField(max_length=60, blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    image_file = models.ImageField(upload_to="groups/", blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL,
                                   related_name="created_groups")
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, through="GroupMembership", related_name="farm_groups")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class GroupMembership(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_admin = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("group", "user")]


class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts")
    group = models.ForeignKey(Group, null=True, blank=True, on_delete=models.CASCADE, related_name="posts")
    text = models.TextField(max_length=3000)
    image_url = models.URLField(max_length=500, blank=True)
    image_file = models.ImageField(upload_to="posts/", blank=True, null=True)
    hidden = models.BooleanField(default=False)
    seed_likes = models.PositiveIntegerField(default=0, help_text="Likes carried over from demo data")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class PostLike(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        unique_together = [("post", "user")]


class SavedPost(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="saves")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        unique_together = [("post", "user")]
