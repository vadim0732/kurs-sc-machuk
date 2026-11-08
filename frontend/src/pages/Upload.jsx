import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';

export default function Upload() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [artwork, setArtwork] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Загружаем жанры при открытии страницы
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api.get('/genres/').then(res => setGenres(res.data)).catch(console.error);
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      setError('Пожалуйста, выберите аудиофайл');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (genre) formData.append('genre', genre);
    formData.append('audio_file', audioFile);
    if (artwork) formData.append('artwork', artwork);

    try {
      await api.post('/tracks/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/'); // После успеха возвращаемся на главную
    } catch (err) {
      console.error(err);
      setError('Ошибка при загрузке. Проверьте файлы.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Загрузить трек</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Название</label>
              <input 
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl focus:outline-none focus:border-zinc-500"
                required 
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Жанр</label>
              <select 
                value={genre} onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl focus:outline-none focus:border-zinc-500 appearance-none"
              >
                <option value="">Выберите жанр</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Описание (необязательно)</label>
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl focus:outline-none focus:border-zinc-500 h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-zinc-500 transition-colors">
              <label className="cursor-pointer">
                <span className="text-zinc-400 text-sm block mb-2">🎵 Аудиофайл (MP3)</span>
                <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="hidden" required />
                <span className="text-white font-medium truncate block">{audioFile ? audioFile.name : 'Нажмите для выбора'}</span>
              </label>
            </div>

            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-zinc-500 transition-colors">
              <label className="cursor-pointer">
                <span className="text-zinc-400 text-sm block mb-2">🖼️ Обложка (JPG/PNG)</span>
                <input type="file" accept="image/*" onChange={(e) => setArtwork(e.target.files[0])} className="hidden" />
                <span className="text-white font-medium truncate block">{artwork ? artwork.name : 'Нажмите для выбора'}</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Загрузка...' : 'Опубликовать трек'}
          </button>
        </form>
      </div>
    </div>
  );
}