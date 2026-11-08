import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import TrackCard from '../components/TrackCard';
import Comments from '../components/Comments';
import Player from '../components/Player';
import api from '../api/client';

export default function Profile() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [profileData, setProfileData] = useState({ user: null, tracks: [] });
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Состояния для редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newAvatar, setNewAvatar] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isOwnProfile = user && user.id === parseInt(id);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = () => {
    setLoading(true);
    api.get(`/users/${id}/tracks/`)
      .then(res => {
        setProfileData(res.data);
        setNewUsername(res.data.user?.username || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handlePlayTrack = (track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы подписаться!');
      return;
    }
    
    try {
      const response = await api.post(`/users/${id}/follow/`);
      
      // Обновляем данные профиля (счетчик и статус подписки)
      setProfileData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          followers_count: response.data.followers_count !== undefined 
            ? response.data.followers_count 
            : (prev.user.is_following ? prev.user.followers_count - 1 : prev.user.followers_count + 1),
          is_following: response.data.status === 'followed'
        }
      }));
    } catch (error) {
      console.error('Ошибка при подписке', error);
    }
  };

  const handleLike = async (trackId) => {
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы ставить лайки!');
      return;
    }
    try {
      const response = await api.post(`/tracks/${trackId}/like/`);
      const { likes_count, status } = response.data;
      const is_liked = status === 'liked';

      setProfileData(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => 
          t.id === trackId ? { ...t, likes_count, is_liked } : t
        )
      }));
      setCurrentTrack(prevTrack => 
        prevTrack && prevTrack.id === trackId 
          ? { ...prevTrack, likes_count, is_liked } 
          : prevTrack
      );
    } catch (error) {
      console.error('Ошибка при лайке', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    if (newUsername) formData.append('username', newUsername);
    if (newAvatar) formData.append('avatar', newAvatar);

    try {
      await api.patch('/auth/update-profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Загрузка профиля...</div>;
  if (!profileData.user) return <div className="p-8 text-center text-zinc-400">Пользователь не найден</div>;

  return (
    <div className="p-8 pb-32 relative z-10 max-w-7xl mx-auto">
      {/* Шапка профиля */}
      <div className="flex items-center gap-8 mb-12 border-b border-zinc-800 pb-8">
        <div className="relative">
          {profileData.user.avatar_url ? (
            <img src={profileData.user.avatar_url} alt="avatar" className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-zinc-800" />
          ) : (
            <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-2xl">
              {profileData.user.username[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-5xl font-black text-white tracking-tight mb-2">{profileData.user.username}</h1>
          <p className="text-zinc-400 text-lg">
            {profileData.tracks.length} {profileData.tracks.length === 1 ? 'трек' : 'треков'} • {profileData.user.followers_count} подписчиков
          </p>
        </div>

        {isOwnProfile ? (
          <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-2 rounded-full border border-zinc-600 text-white font-medium hover:bg-zinc-800 transition-colors">
            {isEditing ? 'Отмена' : 'Редактировать'}
          </button>
        ) : (
          user && (
            <button 
              onClick={handleFollow}
              className={`px-8 py-2 rounded-full font-bold transition-colors ${
                profileData.user.is_following 
                  ? 'bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700' 
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {profileData.user.is_following ? 'Отписаться' : 'Подписаться'}
            </button>
          )
        )}
      </div>

      {/* Форма редактирования */}
      {isEditing && (
        <form onSubmit={handleUpdateProfile} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-12 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-zinc-400 text-sm mb-2">Новое имя</label>
            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-zinc-500" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-zinc-400 text-sm mb-2">Новая аватарка</label>
            <input type="file" accept="image/*" onChange={(e) => setNewAvatar(e.target.files[0])} className="w-full text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700" />
          </div>
          <button type="submit" disabled={isSaving} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50">
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      )}

      {/* Список треков */}
      <h2 className="text-2xl font-bold text-white mb-6">Треки</h2>
      
      {profileData.tracks.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <p className="text-zinc-400 text-lg mb-4">У этого пользователя пока нет треков.</p>
          {isOwnProfile && (
            <Link to="/upload" className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full font-medium hover:bg-orange-600 transition-colors">Загрузить первый трек</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profileData.tracks.map(track => (
            <div key={track.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800/50">
              <TrackCard 
                track={track} 
                onPlay={handlePlayTrack} 
                isPlaying={currentTrack?.id === track.id && isPlaying} 
                onLike={() => handleLike(track.id)}
                onCommentClick={() => {}} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Плеер в профиле */}
      {currentTrack && (
        <Player 
          track={currentTrack} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying} 
          onLike={() => handleLike(currentTrack.id)}
        />
      )}
    </div>
  );
}