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