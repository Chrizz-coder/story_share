'use client';

import React from 'react';
import { useAudio } from '@/context/AudioContext';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import styles from './AudioPlayer.module.css';

export default function AudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, volume, setVolume } = useAudio();

  if (!currentTrack) return null;

  return (
    <div className={styles.playerWrapper}>
      <button onClick={togglePlay} className={styles.playButton} aria-label={isPlaying ? 'Pause music' : 'Play music'}>
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      
      <div className={styles.volumeControl}>
        <button 
          onClick={() => setVolume(volume === 0 ? 0.5 : 0)} 
          className={styles.volumeButton}
          aria-label={volume === 0 ? 'Unmute' : 'Mute'}
        >
          {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className={styles.volumeSlider}
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
