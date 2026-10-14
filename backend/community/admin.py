from django.contrib import admin

from .models import Comment, Group, GroupMembership, Post

for model in [Post, Comment, Group, GroupMembership]:
    admin.site.register(model)
