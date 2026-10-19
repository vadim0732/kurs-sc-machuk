from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Track


@api_view(['GET'])
def track_list(request):
    """Список всех публичных треков"""
    tracks = Track.objects.filter(is_public=True, is_deleted=False).order_by('-created_at')
    
    data = []
    for track in tracks:
        data.append({
            'id': track.id,
            'title': track.title,
            'user': track.user.username if track.user else 'Удалён',
            'genre': track.genre.name if track.genre else None,
            'duration': track.duration,
            'plays_count': track.plays_count,
            'audio_url': request.build_absolute_uri(track.audio_file.url) if track.audio_file else None,
            'artwork_url': request.build_absolute_uri(track.artwork.url) if track.artwork else None,
        })
    
    return Response(data)