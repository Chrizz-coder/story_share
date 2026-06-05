export interface Track {
  id: string;
  name: string;
  category: 'Romantic Lofi' | 'Soft Piano' | 'Dreamy Ambient' | 'Acoustic Guitar' | 'Sunset Chill';
  artist: string;
  url: string;
}

export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'romantic-lofi',
    name: 'Midnight Musings',
    category: 'Romantic Lofi',
    artist: 'Lofi Dreamer',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'soft-piano',
    name: 'Morning Dew Drops',
    category: 'Soft Piano',
    artist: 'Pianissimo',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'dreamy-ambient',
    name: 'Stardust Symphony',
    category: 'Dreamy Ambient',
    artist: 'Aether Waves',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'acoustic-guitar',
    name: 'Campfire Harmonies',
    category: 'Acoustic Guitar',
    artist: 'Wood & Wire',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 'sunset-chill',
    name: 'Golden Hour Groove',
    category: 'Sunset Chill',
    artist: 'Coastal Vibe',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
];
