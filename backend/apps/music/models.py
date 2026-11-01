from django.conf import settings
from django.db import models


class Genre(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    class Meta:
        db_table = 'music_genre'
        ordering = ['name']

    def __str__(self):
        return self.name


class Track(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает обработки'),
        ('processing', 'Обрабатывается'),
        ('ready', 'Готов'),
        ('failed', 'Ошибка'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='tracks',
    )
    genre = models.ForeignKey(
        Genre,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tracks',
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    audio_file = models.FileField(upload_to='tracks/%Y/%m/')
    artwork = models.ImageField(upload_to='artwork/%Y/%m/', null=True, blank=True)

    duration = models.PositiveIntegerField(default=0, help_text='секунды')
    waveform_data = models.JSONField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    is_public = models.BooleanField(default=True)
    track_number = models.PositiveSmallIntegerField(null=True, blank=True)

    plays_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)

    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'music_track'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['genre', '-created_at']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['is_public', 'is_deleted', '-created_at']),
        ]

    def __str__(self):
        return self.title

class Album(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='albums'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    artwork = models.ImageField(upload_to='album_artwork/%Y/%m/', null=True, blank=True)
    release_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default='draft') # draft, published, archived
    is_public = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'music_album'
        ordering = ['-release_date', '-created_at']

    def __str__(self):
        return self.title


class Playlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='playlists'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    artwork = models.ImageField(upload_to='playlist_artwork/%Y/%m/', null=True, blank=True)
    is_public = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Связь многие-ко-многим через промежуточную таблицу PlaylistTrack
    tracks = models.ManyToManyField(Track, through='PlaylistTrack', related_name='playlists')

    class Meta:
        db_table = 'music_playlist'
        ordering = ['-updated_at']

    def __str__(self):
        return self.title


class PlaylistTrack(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    order = models.DecimalField(max_digits=38, decimal_places=20, db_index=True) # Для drag-and-drop
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'music_playlist_track'
        ordering = ['order']
        unique_together = ('playlist', 'track') # Один трек не может быть дважды в одном плейлисте

    def __str__(self):
        return f'{self.track.title} в {self.playlist.title}'


class TrackArtist(models.Model):
    ROLES = [
        ('main', 'Основной'),
        ('featured', 'Feat.'),
        ('producer', 'Продюсер'),
        ('remixer', 'Ремиксер'),
    ]
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='artists')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='featured_on')
    role = models.CharField(max_length=20, choices=ROLES, default='featured')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'music_track_artist'
        unique_together = ('track', 'user', 'role')
        ordering = ['order']

    def __str__(self):
        return f'{self.user} ({self.role}) на {self.track}'