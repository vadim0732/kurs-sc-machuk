from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.users.views import RegisterView, update_profile
from apps.music.views import (
    track_list, upload_track, genre_list, 
    playlist_list, playlist_detail, user_tracks, search_tracks,
)
from apps.social.views import toggle_like, track_comments, toggle_follow

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/update-profile/', update_profile, name='update-profile'),

    # Аутентификация
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Музыка
    path('api/tracks/', track_list, name='track-list'),
    path('api/tracks/upload/', upload_track, name='track-upload'),
    path('api/genres/', genre_list, name='genre-list'),
    path('api/users/<int:user_id>/tracks/', user_tracks, name='user-tracks'),
    
    # Плейлисты
    path('api/playlists/', playlist_list, name='playlist-list'),
    path('api/playlists/<int:playlist_id>/', playlist_detail, name='playlist-detail'),
    
    # Социалка
    path('api/tracks/<int:track_id>/like/', toggle_like, name='track-like'),
    path('api/tracks/<int:track_id>/comments/', track_comments, name='track-comments'),
    path('api/users/<int:user_id>/follow/', toggle_follow, name='user-follow'),
    path('api/search/', search_tracks, name='search-tracks'),
    
    # HTML плеер (для теста)
    path('player/', TemplateView.as_view(template_name='player.html'), name='player'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)