'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { DEFAULT_TRACKS, Track } from '@/lib/tracks';

interface AudioContextType {
  tracks: Track[];
  currentTrack: Track;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  selectTrack: (trackId: string) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  playTrack: (url: string) => void; // backwards compatibility
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track>(DEFAULT_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedTrackId = localStorage.getItem('storyshare_audio_track_id');
    const savedVolume = localStorage.getItem('storyshare_audio_volume');
    const savedMuted = localStorage.getItem('storyshare_audio_muted');

    if (savedTrackId) {
      const track = DEFAULT_TRACKS.find((t) => t.id === savedTrackId);
      if (track) setCurrentTrack(track);
    }
    if (savedVolume) {
      setVolumeState(parseFloat(savedVolume));
    }
    if (savedMuted) {
      setIsMuted(savedMuted === 'true');
    }

    audioRef.current = new Audio();
    
    // Set initial properties
    audioRef.current.volume = savedVolume ? parseFloat(savedVolume) : 0.5;
    audioRef.current.muted = savedMuted === 'true';

    // Event listeners
    const onTimeUpdate = () => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const onEnded = () => {
      nextTrack();
    };

    audioRef.current.addEventListener('timeupdate', onTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
    audioRef.current.addEventListener('ended', onEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', onTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
        audioRef.current.removeEventListener('ended', onEnded);
      }
    };
  }, []);

  // Update src when currentTrack changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    const wasPlaying = isPlaying;
    audioRef.current.src = currentTrack.url;
    audioRef.current.load();

    if (wasPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      setIsPlaying(false);
    }
  }, [currentTrack]);

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn('Playback blocked or failed:', err);
        setIsPlaying(false);
      });
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
    localStorage.setItem('storyshare_audio_muted', String(nextMute));
  };

  const setVolume = (v: number) => {
    if (!audioRef.current) return;
    const boundedVolume = Math.max(0, Math.min(1, v));
    setVolumeState(boundedVolume);
    audioRef.current.volume = boundedVolume;
    localStorage.setItem('storyshare_audio_volume', String(boundedVolume));
  };

  const selectTrack = (trackId: string) => {
    const track = DEFAULT_TRACKS.find((t) => t.id === trackId);
    if (track) {
      setCurrentTrack(track);
      localStorage.setItem('storyshare_audio_track_id', trackId);
      
      // Auto-play selected track
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(console.error);
        }
      }, 50);
    }
  };

  const nextTrack = () => {
    const currentIndex = DEFAULT_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % DEFAULT_TRACKS.length;
    selectTrack(DEFAULT_TRACKS[nextIndex].id);
  };

  const prevTrack = () => {
    const currentIndex = DEFAULT_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + DEFAULT_TRACKS.length) % DEFAULT_TRACKS.length;
    selectTrack(DEFAULT_TRACKS[prevIndex].id);
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Backwards compatibility handler
  const playTrack = (url: string) => {
    const track = DEFAULT_TRACKS.find((t) => t.url === url || t.id === url);
    if (track) {
      selectTrack(track.id);
    } else if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        tracks: DEFAULT_TRACKS,
        currentTrack,
        isPlaying,
        isMuted,
        volume,
        currentTime,
        duration,
        play,
        pause,
        togglePlay,
        toggleMute,
        setVolume,
        selectTrack,
        nextTrack,
        prevTrack,
        seek,
        playTrack,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
