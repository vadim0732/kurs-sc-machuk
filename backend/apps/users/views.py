from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer

User = get_user_model()

# --- РЕГИСТРАЦИЯ ---
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Пользователь успешно создан"}, status=status.HTTP_201_CREATED)


# --- ОБНОВЛЕНИЕ ПРОФИЛЯ (Имя и Аватарка) ---
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    
    # Обновляем имя пользователя (username)
    if 'username' in request.data:
        new_username = request.data['username']
        # Проверяем, не занято ли это имя
        if User.objects.filter(username=new_username).exclude(id=user.id).exists():
            return Response({'error': 'Это имя уже занято'}, status=status.HTTP_400_BAD_REQUEST)
        user.username = new_username

    # Обновляем аватарку (если пришел файл)
    if 'avatar' in request.FILES:
        user.avatar = request.FILES['avatar']

    # Если нужно удалить аватарку
    if request.data.get('remove_avatar') == 'true':
        user.avatar = None

    user.save()
    
    return Response({
        'status': 'success',
        'username': user.username,
        'avatar_url': user.avatar.url if user.avatar else None
    })