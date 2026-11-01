import { useRef, useState, useEffect } from 'react';

export default function Player({ track, isPlaying, setIsPlaying, onLike }) {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [track]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.log(e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, track]);

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const handleVolume = (e) => {
    const vol = Number(e.target.value);
    audioRef.current.volume = vol;
    setVolume(vol);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-2xl border-t border-zinc-800 px-6 py-4 shadow-2xl z-50">
      <audio 
        ref={audioRef} 
        src={track.audio_url} 
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        
        {/* Левая часть: Инфо о треке */}
        <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
          {track.artwork_url ? (
            <img src={track.artwork_url} className="w-14 h-14 rounded-md shadow-lg object-cover" alt="cover" />
          ) : (
            <div className="w-14 h-14 bg-zinc-800 rounded-md flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-zinc-600">
                  <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 0 1 .298.599V16.353a2.373 2.373 0 0 1-2.167 2.357A2.37 2.37 0 0 1 15.5 16.5v-2.89l-7.5 2.5V19a2.25 2.25 0 1 1-2.25-2.25H9v-6.158a2.25 2.25 0 0 1 1.54-2.134l7.5-2.5a.75.75 0 0 1 .912.393Z" clipRule="evenodd" />
               </svg>
            </div>
          )}
          <div className="overflow-hidden">
            <p className="font-semibold text-white text-sm truncate">{track.title}</p>
            <p className="text-zinc-400 text-xs truncate">{track.user}</p>
          </div>
        </div>
        
        {/* Центральная часть: Кнопка Play и полоса прогресса */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-2xl">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform mb-2"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
            )}
          </button>
          
          <div className="w-full flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-mono tracking-wider">{formatTime(progress)}</span>
            <input 
              type="range" min="0" max={duration || 0} value={progress} onChange={handleSeek}
              className="flex-1 h-1 cursor-pointer"
              style={{ '--progress': `${progressPercent}%` }}
            />
            <span className="text-xs text-zinc-400 font-mono tracking-wider">{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Правая часть: Лайк и Громкость */}
        <div className="w-1/4 flex justify-end items-center gap-5 min-w-[150px]">
          
          {/* Кнопка лайка в плеере */}
          <button 
            onClick={onLike}
            className={`flex items-center gap-1.5 transition-colors ${track.is_liked ? 'text-orange-500' : 'text-zinc-400 hover:text-orange-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={track.is_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={track.is_liked ? 0 : 2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            <span className="text-xs font-semibold">{track.likes_count || 0}</span>
          </button>

          {/* Громкость */}
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-zinc-400">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
            </svg>
            <input 
              type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolume}
              className="w-20 h-1 cursor-pointer"
              style={{ '--progress': `${volume * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}