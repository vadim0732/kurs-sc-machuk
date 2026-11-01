import { Routes, Route, Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import TrackCard from './components/TrackCard';
import Player from './components/Player';
import api from './api/client';

function HomePage() {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    api.get('/tracks/')
      .then(res => setTracks(res.data))
      .catch(err => console.error(err));
  }, []);

  const handlePlayTrack = (track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  // ЕДИНАЯ функция для лайка
  const handleLike = async (trackId) => {
    try {
      const response = await api.get(`/tracks/${trackId}/like/`);
      const { likes_count, status } = response.data;
      const is_liked = status === 'liked';

      // 1. Обновляем трек в общем списке (карточки)
      setTracks(prevTracks => 
        prevTracks.map(t => 
          t.id === trackId ? { ...t, likes_count, is_liked } : t
        )
      );

      // 2. Обновляем трек в плеере (если он там сейчас играет)
      setCurrentTrack(prevTrack => 
        prevTrack && prevTrack.id === trackId 
          ? { ...prevTrack, likes_count, is_liked } 
          : prevTrack
      );
    } catch (error) {
      console.error('Ошибка при лайке', error);
    }
  };

  return (
    <div className="p-8 pb-32 relative z-10">
      <h1 className="text-4xl font-extrabold text-white mb-10 tracking-tight">Треки</h1>
      
      {tracks.length === 0 ? (
        <p className="text-zinc-400 text-lg">Здесь пока пусто. Самое время загрузить первый трек.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map(track => (
            <TrackCard 
              key={track.id} 
              track={track} 
              onPlay={handlePlayTrack} 
              isPlaying={currentTrack?.id === track.id && isPlaying} 
              onLike={() => handleLike(track.id)} // <-- Передаем функцию лайка
            />
          ))}
        </div>
      )}

      {currentTrack && (
        <Player 
          track={currentTrack} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying} 
          onLike={() => handleLike(currentTrack.id)} // <-- Передаем функцию лайка
        />
      )}
    </div>
  );
}

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30 relative overflow-hidden">
      
      {/* Фоновый декор (Анимированное свечение) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Оранжевое пятно */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[120px] animate-blob"></div>
        {/* Фиолетовое пятно (для контраста) */}
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        {/* Второе оранжевое пятно снизу */}
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Навигационная панель */}
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black text-white tracking-tighter group-hover:text-orange-500 transition-colors">Pulse</span>
        </Link>
        <div>
          {user ? (
            <button 
              onClick={logout} 
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Выйти
            </button>
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
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;