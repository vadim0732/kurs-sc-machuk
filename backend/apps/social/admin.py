from django.contrib import admin
from .models import Follow, Like, Comment, Play


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ['follower', 'following', 'created_at']
    search_fields = ['follower__username', 'following__username']

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'track', 'created_at']
    search_fields = ['user__username', 'track__title']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'track', 'body', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'track__title', 'body']

@admin.register(Play)
class PlayAdmin(admin.ModelAdmin):
    list_display = ['user', 'track', 'played_at']
    list_filter = ['played_at']