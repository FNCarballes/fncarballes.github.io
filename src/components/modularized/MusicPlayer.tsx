import React, { useState, useRef, useEffect } from 'react';
import barroTalVez from '@/assets/music/BarroTalVez-OliFirpo.mp3';
import soyQuien from '@/assets/music/SoyQuienNoHaDeMorir.mp3';
import showMeHow from '@/assets/music/Showmehowtolive-Audioslave.mp3';

const playlist: Song[] = [
  { id: 1, title: "Barro tal vez", artist: "Oli Firpo", src: barroTalVez },
  { id: 3, title: "Soy quién no ha de morir", artist: "Divididos", src: soyQuien },
  { id: 2, title: "Show me how to live", artist: "Audioslave", src: showMeHow },
];
interface Song {
  id: number;
  title: string;
  artist: string;
  src: string;
}


interface Props {
  scrolled: boolean;
}

const MusicPlayer = ({ scrolled }: Props) => {
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentSong = playlist[currentSongIndex];

  // --- CONTROLES DE REPRODUCCIÓN ---
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentSongIndex((prevIndex) =>
      prevIndex === playlist.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      setCurrentSongIndex((prevIndex) =>
        prevIndex === 0 ? playlist.length - 1 : prevIndex - 1
      );
    }
  };

  // --- EVENTOS DEL AUDIO ---
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  // --- INTERACCIÓN CON LA BARRA DE PROGRESO ---
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current || !duration) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // --- EFECTOS ---
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(error => console.log("Autoplay prevent: ", error));
    }
  }, [currentSongIndex, isPlaying]);

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  // Variables de color para adaptarse al scroll
  const textColor = scrolled ? 'text-white' : 'text-black';
  const subtextColor = scrolled ? 'text-gray-300' : 'text-gray-700';
  const iconColor = scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-black';
  const progressBg = scrolled ? 'bg-white/30' : 'bg-black/20';
  const progressFill = scrolled ? 'bg-white' : 'bg-black';

  return (
    <div className="z-50 flex flex-col gap-1 sm:gap-2 hover:scale-110
     px-4 py-2 backdrop-blur-lg bg-[#ffffff17] border-white/10 shadow-xl border rounded-xl w-[100%] max-w-[300px] transition-all">
      <audio
        ref={audioRef}
        src={currentSong.src}
        onEnded={handleNext}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-3 w-full">
        
        {/* Info de la canción */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 overflow-hidden w-full">
          <span className={`${textColor} font-semibold text-sm sm:text-lg truncate w-full transition-colors`}>
            {currentSong.title}
          </span>
          <span className={`${subtextColor} text-sm sm:text-lg truncate w-full transition-colors`}>
            {currentSong.artist}
          </span>
        </div>

        {/* Controles de Playback */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={(e) => e.stopPropagation()}
            onClick={handlePrev}
            className={`${iconColor} transition-colors`}
            aria-label="Anterior o Reiniciar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onTouchStart={(e) => e.stopPropagation()}
            onClick={togglePlay}
            className="bg-white text-black p-2 rounded-full hover:scale-105 transition-transform"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onTouchStart={(e) => e.stopPropagation()}
            onClick={handleNext}
            className={`${iconColor} transition-colors`}
            aria-label="Siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full mt-0">
        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          className={`w-full h-1 rounded-full cursor-pointer overflow-hidden ${progressBg} transition-colors`}
        >
          <div
            className={`h-full rounded-full ${progressFill} transition-all duration-75 ease-linear`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

    </div>
  );
};

export default MusicPlayer;