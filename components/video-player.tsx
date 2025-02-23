"use client"
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface CustomVideoPlayerProps {
  videoSrc: string;
}

// Hook para controle de progresso do vídeo
function useVideoProgress(videoRef: React.RefObject<HTMLVideoElement | null>, autoplay: boolean) {
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleVideoEnd = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", handleVideoEnd);

    if (autoplay) {
      video.play().catch((error) => console.error("Autoplay failed:", error));
    }

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, [autoplay, videoRef]);

  const handleProgressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = (Number(e.target.value) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(Number(e.target.value));
  }, [videoRef]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current[isPlaying ? 'pause' : 'play']();
    setIsPlaying(!isPlaying);
  }, [isPlaying, videoRef]);

  return { progress, isPlaying, handleProgressChange, togglePlay };
}

// Hook para controle de volume
function useVideoVolume(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [volume, setVolume] = useState<number>(1);
  const [currentVolume, setCurrentVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    setVolume(isMuted ? currentVolume : 0);
  }, [isMuted, currentVolume, videoRef]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = Number(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setCurrentVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, [videoRef]);

  return { volume, isMuted, toggleMute, handleVolumeChange };
}

// Hook para controle de tela cheia e controles
function useVideoControls(playerRef: React.RefObject<HTMLDivElement | null>, isPlaying: boolean) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [lastMouseMoveTime, setLastMouseMoveTime] = useState(Date.now());

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setLastMouseMoveTime(Date.now());
      setShowControls(true);
    };

    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    const checkMouseInactivity = () => {
      const currentTime = Date.now();
      if (currentTime - lastMouseMoveTime > 3000 && isFullscreen) {
        setShowControls(false);
      }
    };

    if (playerRef.current) {
      playerRef.current.addEventListener("mousemove", handleMouseMove);
      playerRef.current.addEventListener("mouseleave", handleMouseLeave);
    }

    const inactivityInterval = setInterval(checkMouseInactivity, 1000);

    return () => {
      if (playerRef.current) {
        playerRef.current.removeEventListener("mousemove", handleMouseMove);
        playerRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
      clearInterval(inactivityInterval);
    };
  }, [isFullscreen, lastMouseMoveTime, isPlaying, playerRef]);

  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
    }
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [playerRef]);

  return { isFullscreen, showControls, toggleFullscreen };
}

export const VideoPlayer: React.FC<CustomVideoPlayerProps> = ({ videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const autoplay = useMemo(() => false, []);

  const { progress, isPlaying, handleProgressChange, togglePlay } = useVideoProgress(videoRef, autoplay);
  const { volume, isMuted, toggleMute, handleVolumeChange } = useVideoVolume(videoRef);
  const { isFullscreen, showControls, toggleFullscreen } = useVideoControls(playerRef, isPlaying);

  return (
    <div ref={playerRef} className="flex flex-col justify-center items-center max-w-full relative mb-16">
      <div className="relative w-full">
        <video
          ref={videoRef}
          className="w-full cursor-pointer"
          src={videoSrc}
          onClick={togglePlay}
        >
          Your browser does not support the video tag.
        </video>
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center" onClick={togglePlay}>
            <Play size={64} className="text-white opacity-50" />
          </div>
        )}
      </div>
      <div className={`
          text-white
          bg-black bg-opacity-50
          p-2 w-full absolute
          bottom-0
          left-0
          transition-opacity duration-300 ease-in-out
          ${showControls ? 'opacity-100' : 'opacity-0'}
        `}>
        <div className="flex items-center justify-between">
          <button onClick={togglePlay} className="p-1 bg-transparent border-none cursor-pointer flex items-center justify-center mr-0 text-inherit">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className={`w-full mx-2 cursor-pointer`}
          />
          <div className="flex items-center">
            <button onClick={toggleMute} className="p-1">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 mx-2"
            />
            <button onClick={toggleFullscreen} className="p-1">
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};