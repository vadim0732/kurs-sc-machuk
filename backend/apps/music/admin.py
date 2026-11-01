from django.contrib import admin
from .models import Genre, Track, Album, Playlist, PlaylistTrack, TrackArtist


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'genre', 'status', 'plays_count', 'likes_count', 'created_at']
    list_filter = ['status', 'genre', 'is_public', 'is_deleted']
    search_fields = ['title', 'user__username', 'user__email']
    raw_id_fields = ['user', 'genre']
    readonly_fields = ['created_at', 'updated_at', 'plays_count', 'likes_count', 'comments_count']

    fieldsets = (
        ('Основное', {
            'fields': ('user', 'title', 'description', 'genre')
        }),
        ('Файлы', {
            'fields': ('audio_file', 'artwork')
        }),
        ('Метаданные', {
            'fields': ('duration', 'waveform_data', 'status', 'track_number')
        }),
        ('Публикация', {
            'fields': ('is_public', 'is_deleted')
        }),
        ('Счётчики', {
            'fields': ('plays_count', 'likes_count', 'comments_count')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'status', 'release_date', 'is_public']
    list_filter = ['status', 'is_public']
    search_fields = ['title', 'user__username']


class PlaylistTrackInline(admin.TabularInline):
    model = PlaylistTrack
    extra = 1


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'is_public', 'updated_at']
    list_filter = ['is_public']
    search_fields = ['title', 'user__username']
    inlines = [PlaylistTrackInline] 


@admin.register(TrackArtist)
class TrackArtistAdmin(admin.ModelAdmin):
    list_display = ['track', 'user', 'role', 'order']
    list_filter = ['role']