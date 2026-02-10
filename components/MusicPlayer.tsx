import React, { useRef, useState, useEffect } from 'react';
import { Music, Play, Pause, Volume2 } from 'lucide-react';

interface Props {
  src: string;
  type: 'mp3' | 'spotify';
}

export const MusicPlayer: React.FC<Props> = ({ src, type }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Attempt to autoplay when src or type changes
    if (audioRef.current && type === 'mp3') {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log("Autoplay prevented by browser policy. User interaction needed.");
            setIsPlaying(false);
          });
      }
    }
  }, [src, type]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Autoplay prevented", e));
    }
    setIsPlaying(!isPlaying);
  };

  const getSpotifyEmbedUrl = (url: string) => {
    try {
      // Handle standard URL: https://open.spotify.com/track/ID...
      // Handle URI: spotify:track:ID
      let id = '';
      if (url.includes('spotify:')) {
        const parts = url.split(':');
        id = parts[parts.length - 1];
      } else {
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        id = lastPart.split('?')[0]; // Remove query params
      }
      
      // Determine if track or playlist based on URL content or default to track
      const type = url.includes('playlist') ? 'playlist' : 'track';
      
      // Add autoplay=1 to try and force playback
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0&autoplay=1`;
    } catch (e) {
      return '';
    }
  };

  if (!src) return null;

  // Render Spotify Player
  if (type === 'spotify') {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-fade-in shadow-2xl rounded-2xl overflow-hidden border-2 border-baby-300 w-[300px] h-[80px] bg-white">
        <iframe 
          src={getSpotifyEmbedUrl(src)} 
          width="100%" 
          height="80" 
          frameBorder="0" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
          title="Spotify Player"
        ></iframe>
      </div>
    );
  }

  // Render MP3 Player (Default)
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio ref={audioRef} src={src} loop autoPlay />
      <button
        onClick={togglePlay}
        className="bg-baby-500 hover:bg-baby-600 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-110 flex items-center gap-2 border-4 border-baby-100"
        title="Tocar Música"
      >
        {isPlaying ? (
          <>
            <Pause size={20} className="animate-pulse" />
            <span className="hidden md:inline font-bold text-sm">Pausar</span>
          </>
        ) : (
          <>
            <Play size={20} />
            <span className="hidden md:inline font-bold text-sm">Tocar Música</span>
          </>
        )}
      </button>
    </div>
  );
};