from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import F, Q

from apps.users.models import User
from apps.social.models import Like, Follow
from .models import Track, Playlist, PlaylistTrack, Genre

# --- СПИСОК ТРЕКОВ ---
@api_view(['GET'])
def track_list(request):
    tracks = Track.objects.filter(is_public=True, is_deleted=False).order_by('-created_at')
    liked_track_ids = Like.objects.filter(user=request.user).values_list('track_id', flat=True) if request.user.is_authenticated else []

    data = []
    for track in tracks:
        data.append({
            'id': track.id,
            'title': track.title,
            'user': track.user.username if track.user else 'Удалён',
            'user_id': track.user.id if track.user else None, # <-- ID автора
            'genre': track.genre.name if track.genre else None,
            'duration': track.duration,
            'plays_count': track.plays_count,
            'audio_url': track.audio_file.url if track.audio_file else None,
            'artwork_url': track.artwork.url if track.artwork else None,
            'likes_count': track.likes_count,
            'is_liked': track.id in liked_track_ids,
        })
    return Response(data)

# --- ЗАГРУЗКА ТРЕКА ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_track(request):
    try:
        title = request.data.get('title')
        genre_id = request.data.get('genre')
        audio_file = request.FILES.get('audio_file')
        artwork = request.FILES.get('artwork')
        description = request.data.get('description', '')

        if not title or not audio_file:
            return Response({'error': 'Название и аудиофайл обязательны'}, status=status.HTTP_400_BAD_REQUEST)

        genre = Genre.objects.filter(id=genre_id).first() if genre_id else None
        track = Track.objects.create(
            user=request.user, title=title, description=description, genre=genre,
            audio_file=audio_file, artwork=artwork, is_public=True, status='ready'
        )
        return Response({'status': 'success', 'track_id': track.id}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- СПИСОК ЖАНРОВ ---
@api_view(['GET'])
def genre_list(request):
    return Response(Genre.objects.all().values('id', 'name'))

# --- ПЛЕЙЛИСТЫ ---
@api_view(['GET', 'POST'])
def playlist_list(request):
    user = request.user if request.user.is_authenticated else User.objects.filter(is_superuser=True).first()
    if request.method == 'GET':
        playlists = Playlist.objects.filter(is_public=True, is_deleted=False)
        return Response([{'id': p.id, 'title': p.title, 'tracks_count': p.tracks.count()} for p in playlists])
    if request.method == 'POST':
        title = request.data.get('title')
        if not title: return Response({'error': 'Название обязательно'}, status=400)
        playlist = Playlist.objects.create(user=user, title=title, description=request.data.get('description', ''))
        return Response({'status': 'created', 'id': playlist.id, 'title': playlist.title})

@api_view(['GET'])
def playlist_detail(request, playlist_id):
    playlist = get_object_or_404(Playlist, id=playlist_id, is_deleted=False)
    tracks = [{'id': pt.track.id, 'title': pt.track.title, 'duration': pt.track.duration, 'audio_url': pt.track.audio_file.url if pt.track.audio_file else None, 'order': float(pt.order)} for pt in playlist.playlisttrack_set.select_related('track').order_by('order')]
    return Response({'id': playlist.id, 'title': playlist.title, 'description': playlist.description, 'user': playlist.user.username if playlist.user else 'Удален', 'tracks': tracks})

# --- ТРЕКИ ПОЛЬЗОВАТЕЛЯ (ДЛЯ ПРОФИЛЯ) ---
@api_view(['GET'])
def user_tracks(request, user_id):
    tracks = Track.objects.filter(user_id=user_id, is_deleted=False).order_by('-created_at')
    liked_track_ids = Like.objects.filter(user=request.user).values_list('track_id', flat=True) if request.user.is_authenticated else []
    user_profile = User.objects.filter(id=user_id).first()
    is_following = Follow.objects.filter(follower=request.user, following=user_profile).exists() if request.user.is_authenticated and user_profile else False

    user_data = {
        'username': user_profile.username if user_profile else 'Пользователь',
        'avatar_url': user_profile.avatar.url if user_profile and user_profile.avatar else None,
        'followers_count': user_profile.followers_count if user_profile else 0,
        'is_following': is_following,
    }

    data = []
    for track in tracks:
        data.append({
            'id': track.id,
            'title': track.title,
            'user': track.user.username if track.user else 'Удалён',
            'user_id': track.user.id if track.user else None, # <-- ID автора
            'genre': track.genre.name if track.genre else None,
            'duration': track.duration,
            'plays_count': track.plays_count,
            'audio_url': track.audio_file.url if track.audio_file else None,
            'artwork_url': track.artwork.url if track.artwork else None,
            'likes_count': track.likes_count,
            'is_liked': track.id in liked_track_ids,
        })
    return Response({'user': user_data, 'tracks': data})

# --- ПОИСК ---
@api_view(['GET'])
def search_tracks(request):
    query = request.query_params.get('q', '').strip()
    if not query: return Response([])
    tracks = Track.objects.filter(Q(title__icontains=query) | Q(user__username__icontains=query), is_public=True, is_deleted=False).order_by('-created_at')[:20]
    liked_track_ids = Like.objects.filter(user=request.user).values_list('track_id', flat=True) if request.user.is_authenticated else []

    data = []
    for track in tracks:
        data.append({
            'id': track.id,
            'title': track.title,
            'user': track.user.username if track.user else 'Удалён',
            'user_id': track.user.id if track.user else None, # <-- ID автора
            'genre': track.genre.name if track.genre else None,
            'duration': track.duration,
            'plays_count': track.plays_count,
            'audio_url': track.audio_file.url if track.audio_file else None,
            'artwork_url': track.artwork.url if track.artwork else None,
            'likes_count': track.likes_count,
            'is_liked': track.id in liked_track_ids,
        })
    return Response(data)