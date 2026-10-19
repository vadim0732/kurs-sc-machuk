from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ['-date_joined']
    list_display = ['email', 'username', 'is_banned', 'is_staff', 'date_joined']
    list_filter = ['is_banned', 'is_staff', 'is_active']
    search_fields = ['email', 'username']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Профиль', {'fields': ('avatar', 'bio')}),
        ('Статус', {'fields': ('is_banned',)}),
        ('Счётчики', {'fields': ('followers_count', 'following_count')}),
    )