export default function Visualizer({ isPlaying }) {
  const animationClass = isPlaying ? 'animate-equalizer' : 'animate-paused';

  return (
    <div className="flex items-end gap-1 h-5">
      <div className={`w-1 bg-orange-500 rounded-sm origin-bottom ${animationClass}`} style={{ animationDelay: '0s' }}></div>
      <div className={`w-1 bg-orange-500 rounded-sm origin-bottom ${animationClass}`} style={{ animationDelay: '0.2s' }}></div>
      <div className={`w-1 bg-orange-500 rounded-sm origin-bottom ${animationClass}`} style={{ animationDelay: '0.4s' }}></div>
      <div className={`w-1 bg-orange-500 rounded-sm origin-bottom ${animationClass}`} style={{ animationDelay: '0.6s' }}></div>
    </div>
  );
}