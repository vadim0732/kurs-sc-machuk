from django.conf import settings
from django.db import models
from django.db.models import Q


class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='following_set'
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='followers_set'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users_follow'
        unique_together = ('follower', 'following')
        constraints = [
            models.CheckConstraint(
                check=~Q(follower=models.F('following')),
                name='prevent_self_follow'
            ),
        ]

    def __str__(self):
        return f'{self.follower} -> {self.following}'


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    track = models.ForeignKey('music.Track', on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'social_like'
        unique_together = ('user', 'track')

    def __str__(self):
        return f'{self.user} лайкнул {self.track}'


class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    track = models.ForeignKey('music.Track', on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    body = models.TextField(max_length=1000)
    timestamp_ms = models.PositiveIntegerField(null=True, blank=True, help_text='Миллисекунды')
    depth = models.PositiveSmallIntegerField(default=0)
    
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'social_comment'
        ordering = ['created_at']
        constraints = [
            models.CheckConstraint(check=Q(depth__lte=2), name='comment_max_depth_2'),
        ]

    def __str__(self):
        return f'Комментарий от {self.user} к {self.track}'


class Play(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    track = models.ForeignKey('music.Track', on_delete=models.CASCADE, related_name='plays')
    session_key = models.CharField(max_length=40, null=True, blank=True)
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'social_play'
        ordering = ['-played_at']

    def __str__(self):
        return f'Прослушивание {self.track}'