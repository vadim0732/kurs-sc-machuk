import { Routes, Route, Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import TrackCard from './components/TrackCard';
import Player from './components/Player';
import Comments from './components/Comments';
import SearchBar from './components/SearchBar';
import api from './api/client';

// HomePage теперь получает состояние плеера через пропсы
function HomePage({ currentTrack, setCurrentTrack, isPlaying, setIsPlaying, handlePlayTrack }) {
  const [tracks, setTracks] = useState([]);
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get('/tracks/')
      .then(res => setTracks(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleLike = async (trackId) => {
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы ставить лайки!');
      return;
    }

    try {
      const response = await api.post(`/tracks/${trackId}/like/`);
      const { likes_count, status } = response.data;
      const is_liked = status === 'liked';

      setTracks(prevTracks => 
        prevTracks.map(t => 
          t.id === trackId ? { ...t, likes_count, is_liked } : t
        )
      );

      setCurrentTrack(prevTrack => 
        prevTrack && prevTrack.id === trackId 
          ? { ...prevTrack, likes_count, is_liked } 
          : prevTrack
      );
    } catch (error) {
      console.error('Ошибка при лайке', error);
      if (error.response?.status === 401) {
        alert('Сессия истекла. Пожалуйста, войдите заново.');
      }
    }
  };

  const toggleComments = (trackId) => {
    setShowCommentsFor(prev => prev === trackId ? null : trackId);
  };

  return (
    <div className="p-8 pb-32 relative z-10">
      <h1 className="text-4xl font-extrabold text-white mb-10 tracking-tight">Треки</h1>
      
      {tracks.length === 0 ? (
        <p className="text-zinc-400 text-lg">Здесь пока пусто. Самое время загрузить первый трек.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map(track => (
            <div key={track.id} className="flex flex-col">
              <TrackCard 
                track={track} 
                onPlay={handlePlayTrack} 
                isPlaying={currentTrack?.id === track.id && isPlaying} 
                onLike={() => handleLike(track.id)}
                onCommentClick={() => toggleComments(track.id)}
              />
              {showCommentsFor === track.id && (
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-b-2xl mt-[-8px] relative z-0">
                  <Comments trackId={track.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const { user, logout } = useContext(AuthContext);
  
  // Состояние плеера вынесено на самый верх
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayTrack = (track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleLike = async (trackId) => {
    // Эта функция нужна для плеера, чтобы лайкать из него
    try {
      const response = await api.post(`/tracks/${trackId}/like/`);
      const { likes_count, status } = response.data;
      const is_liked = status === 'liked';
      
      // Обновляем текущий трек в плеере
      setCurrentTrack(prevTrack => 
        prevTrack && prevTrack.id === trackId 
          ? { ...prevTrack, likes_count, is_liked } 
          : prevTrack
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30 relative overflow-hidden">
      
      {/* Фоновый декор */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Навигационная панель */}
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <span className="text-2xl font-black text-white tracking-tighter group-hover:text-orange-500 transition-colors">Pulse</span>
        </Link>
        
        {/* Поиск по центру (передаем функцию запуска) */}
        <div className="flex-1 flex justify-center px-4">
          <SearchBar onPlay={handlePlayTrack} />
        </div>

        <div className="flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-6">
              <Link 
                to={`/profile/${user.id}`}
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Мой профиль
              </Link>
              <Link 
                to="/upload" 
                className="text-sm font-medium bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 transition-colors"
              >
                Загрузить
              </Link>
              <button 
                onClick={logout} 
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Выйти
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="text-sm font-medium bg-white text-black px-6 py-2 rounded-full hover:bg-zinc-200 transition-colors"
            >
              Войти
            </Link>
          )}
        </div>
      </nav>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto w-full relative z-10">
        <Routes>
          <Route path="/" element={
            <HomePage 
              currentTrack={currentTrack}
              setCurrentTrack={setCurrentTrack}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              handlePlayTrack={handlePlayTrack}
            />
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Routes>
      </main>

      {/* Плеер рендерится на уровне App, поэтому музыка не прервется при переходе на другую страницу */}
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

export default App;