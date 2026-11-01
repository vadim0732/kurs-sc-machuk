from apps.users.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Track, Playlist, PlaylistTrack
from apps.social.models import Like

@api_view(['GET', 'POST'])
def playlist_list(request):
    """Получить список плейлистов или создать новый"""
    
    # Временно используем суперюзера для теста
    user = request.user
    if not user.is_authenticated:
        user = User.objects.filter(is_superuser=True).first()

    if request.method == 'GET':
        playlists = Playlist.objects.filter(is_public=True, is_deleted=False)
        data = [{
            'id': p.id,
            'title': p.title,
            'description': p.description,
            'user': p.user.username if p.user else 'Удален',
            'tracks_count': p.tracks.count()
        } for p in playlists]
        return Response(data)

    if request.method == 'POST':
        title = request.data.get('title')
        if not title:
            return Response({'error': 'Название обязательно'}, status=400)
        
        playlist = Playlist.objects.create(
            user=user,
            title=title,
            description=request.data.get('description', '')
        )
        return Response({'status': 'created', 'id': playlist.id, 'title': playlist.title})


@api_view(['GET'])
def playlist_detail(request, playlist_id):
    """Получить детали плейлиста с его треками"""
    playlist = get_object_or_404(Playlist, id=playlist_id, is_deleted=False)
    
    # Получаем треки плейлиста, отсортированные по order
    playlist_tracks = playlist.playlisttrack_set.select_related('track').order_by('order')
    
    tracks_data = []
    for pt in playlist_tracks:
        track = pt.track
        tracks_data.append({
            'id': track.id,
            'title': track.title,
            'duration': track.duration,
            'audio_url': track.audio_file.url if track.audio_file else None,
            'order': float(pt.order)
        })

    data = {
        'id': playlist.id,
        'title': playlist.title,
        'description': playlist.description,
        'user': playlist.user.username if playlist.user else 'Удален',
        'tracks': tracks_data
    }
    return Response(data)

@api_view(['GET'])
def track_list(request):
    tracks = Track.objects.filter(is_public=True, is_deleted=False).order_by('-created_at')
    
    # Если пользователь авторизован, получаем список его лайков
    liked_track_ids = []
    if request.user.is_authenticated:
        liked_track_ids = Like.objects.filter(user=request.user).values_list('track_id', flat=True)

    data = []
    for track in tracks:
        data.append({
            'id': track.id,
            'title': track.title,
            'user': track.user.username if track.user else 'Удалён',
            'genre': track.genre.name if track.genre else None,
            'duration': track.duration,
            'plays_count': track.plays_count,
            'audio_url': track.audio_file.url if track.audio_file else None,
            'artwork_url': track.artwork.url if track.artwork else None,
            'likes_count': track.likes_count,
            'is_liked': track.id in liked_track_ids, # <-- Отдаем, лайкнул ли текущий юзер
        })
    
    return Response(data)