export default function TrackCard({ track, onPlay, isPlaying, onLike }) {
  
  const handleLikeClick = (e) => {
    e.stopPropagation(); // Чтобы не запускался плеер
    onLike();
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    onPlay(track);
  };

  return (
    <div 
      onClick={() => onPlay(track)}
      className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 p-4 rounded-2xl cursor-pointer hover:bg-zinc-800/80 transition-all duration-300 shadow-lg hover:shadow-2xl animate-fade-in-up"
    >
      <div className="relative overflow-hidden rounded-xl aspect-square mb-4">
        {track.artwork_url ? (
          <img 
            src={track.artwork_url} 
            alt="cover" 
            className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : 'group-hover:scale-105'}`} 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-zinc-600">
              <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 0 1 .298.599V16.353a2.373 2.373 0 0 1-2.167 2.357A2.37 2.37 0 0 1 15.5 16.5v-2.89l-7.5 2.5V19a2.25 2.25 0 1 1-2.25-2.25H9v-6.158a2.25 2.25 0 0 1 1.54-2.134l7.5-2.5a.75.75 0 0 1 .912.393Z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        <button 
          onClick={handlePlayClick}
          className={`absolute bottom-4 right-4 bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 ${isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'}`}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
          )}
        </button>
      </div>
      
      <div className="flex justify-between items-start">
        <div className="overflow-hidden">
          <h3 className="text-white font-bold truncate text-lg">{track.title}</h3>
          <p className="text-zinc-400 text-sm truncate">{track.user}</p>
        </div>
        
        <button 
          onClick={handleLikeClick}
          className={`flex flex-col items-center transition-colors ml-2 ${track.is_liked ? 'text-orange-500' : 'text-zinc-500 hover:text-orange-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={track.is_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={track.is_liked ? 0 : 2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          <span className="text-xs font-semibold mt-1">{track.likes_count || 0}</span>
        </button>
      </div>
    </div>
  );
}