import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

// Принимаем onPlay в пропсах
export default function SearchBar({ onPlay }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      api.get(`/search/?q=${query}`)
        .then(res => {
          setResults(res.data);
          setIsSearching(false);
        })
        .catch(err => {
          console.error(err);
          setIsSearching(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Передаем весь объект track, а не только ID
  const handleSelect = (track) => {
    setQuery('');
    setResults([]);
    
    // Если функция onPlay передана — запускаем трек
    if (onPlay) {
      onPlay(track);
    }
    
    // Переходим на главную, чтобы плеер был виден
    navigate('/'); 
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Инпут */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск треков или артистов..."
          className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:border-zinc-600 transition-colors text-sm"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      {/* Выпадающий список результатов */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="max-h-80 overflow-y-auto">
            {results.map(track => (
              <div 
                key={track.id}
                onClick={() => handleSelect(track)} // <-- Передаем весь track
                className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                {track.artwork_url ? (
                  <img src={track.artwork_url} alt="cover" className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center text-xs">🎵</div>
                )}
                <div className="overflow-hidden">
                  <p className="text-white text-sm font-semibold truncate">{track.title}</p>
                  <p className="text-zinc-400 text-xs truncate">{track.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}