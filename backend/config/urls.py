from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from apps.music.views import track_list
from apps.social.views import toggle_like  # ← добавь

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/tracks/', track_list, name='track-list'),
    path('api/tracks/<int:track_id>/like/', toggle_like, name='track-like'), # ← добавь
    path('player/', TemplateView.as_view(template_name='player.html'), name='player'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)