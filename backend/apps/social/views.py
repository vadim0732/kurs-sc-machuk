from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import F
from apps.music.models import Track
from apps.users.models import User
from .models import Like, Comment, Follow

# --- ЛАЙКИ ---
@api_view(['GET', 'POST'])
def toggle_like(request, track_id):
    track = get_object_or_404(Track, id=track_id)
    
    # ВРЕМЕННО: Берем суперюзера, так как мы не авторизованы
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


# --- КОММЕНТАРИИ ---
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def track_comments(request, track_id):
    track = get_object_or_404(Track, id=track_id)

    if request.method == 'GET':
        comments = track.comments.filter(is_deleted=False).order_by('-created_at')
        data = [{
            'id': c.id,
            'user': c.user.username if c.user else 'Удалён',
            'body': c.body,
            'created_at': c.created_at,
        } for c in comments]
        return Response(data)

    if request.method == 'POST':
        user = request.user
        if not user.is_authenticated:
            user = User.objects.filter(is_superuser=True).first()

        body = request.data.get('body')
        if not body:
            return Response({'error': 'Текст обязателен'}, status=400)

        comment = Comment.objects.create(user=user, track=track, body=body)
        Track.objects.filter(id=track.id).update(comments_count=F('comments_count') + 1)

        return Response({
            'status': 'created',
            'comment_id': comment.id,
            'body': comment.body,
            'user': user.username
        })


# --- ПОДПИСКИ ---
@api_view(['GET', 'POST'])
def toggle_follow(request, user_id):
    target_user = get_object_or_404(User, id=user_id)
    user = request.user
    if not user.is_authenticated:
        user = User.objects.filter(is_superuser=True).first()

    if user == target_user:
        return Response({'error': 'Нельзя подписаться на себя'}, status=400)

    follow, created = Follow.objects.get_or_create(follower=user, following=target_user)

    if not created:
        follow.delete()
        User.objects.filter(id=user.id, following_count__gt=0).update(following_count=F('following_count') - 1)
        User.objects.filter(id=target_user.id, followers_count__gt=0).update(followers_count=F('followers_count') - 1)
        return Response({'status': 'unfollowed'})
    else:
        User.objects.filter(id=user.id).update(following_count=F('following_count') + 1)
        User.objects.filter(id=target_user.id).update(followers_count=F('followers_count') + 1)
        return Response({'status': 'followed'})