from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import F
from apps.music.models import Track
from apps.users.models import User
from .models import Like

@api_view(['GET', 'POST'])  # <-- ИЗМЕНИЛИ ЗДЕСЬ
def toggle_like(request, track_id):
    """Поставить или убрать лайк (переключатель)"""
    track = get_object_or_404(Track, id=track_id)
    
    user = request.user
    if not user.is_authenticated:
        user = User.objects.filter(is_superuser=True).first()
    
    if not user:
        return Response({'error': 'Нет пользователей в базе'}, status=400)

    like, created = Like.objects.get_or_create(user=user, track=track)
    
    if not created:
        like.delete()
        Track.objects.filter(id=track.id, likes_count__gt=0).update(likes_count=F('likes_count') - 1)
        return Response({'status': 'unliked', 'likes_count': max(0, track.likes_count - 1)})
    else:
        Track.objects.filter(id=track.id).update(likes_count=F('likes_count') + 1)
        return Response({'status': 'liked', 'likes_count': track.likes_count + 1})