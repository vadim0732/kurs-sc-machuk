from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

# Импорты для JWT и API
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from apps.users.views import RegisterView
from apps.music.views import track_list, playlist_list, playlist_detail
from apps.social.views import toggle_like, track_comments, toggle_follow

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Аутентификации
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API Музыки и Социалки
    path('api/tracks/', track_list, name='track-list'),
    path('api/tracks/<int:track_id>/like/', toggle_like, name='track-like'),
    path('api/tracks/<int:track_id>/comments/', track_comments, name='track-comments'),
    path('api/users/<int:user_id>/follow/', toggle_follow, name='user-follow'),
    path('api/playlists/', playlist_list, name='playlist-list'),
    path('api/playlists/<int:playlist_id>/', playlist_detail, name='playlist-detail'),
    
    # HTML плеер
    path('player/', TemplateView.as_view(template_name='player.html'), name='player'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)