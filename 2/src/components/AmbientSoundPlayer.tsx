import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AmbientSound } from '../types';

class NoiseGenerator {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5;

  constructor() {}

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private createNoiseBuffer(type: string): AudioBuffer {
    this.initContext();
    const ctx = this.audioContext!;
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const dataL = buffer.getChannelData(0);
    const dataR = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      let noise = Math.random() * 2 - 1;

      switch (type) {
        case 'rain':
          noise = Math.sin(i * 0.01) * 0.3 + noise * 0.7;
          if (i % 100 < 10) {
            noise *= 1.5;
          }
          break;
        case 'cafe':
          noise = noise * 0.3;
          const oscillation = Math.sin(i * 0.001) * 0.2 + Math.sin(i * 0.003) * 0.1;
          noise += oscillation;
          break;
        case 'fire':
          noise = Math.abs(noise) * 0.8 - 0.4;
          const crackle = Math.random() > 0.995 ? (Math.random() * 2 - 1) * 0.5 : 0;
          noise += crackle;
          break;
      }

      dataL[i] = noise;
      dataR[i] = noise;
    }

    return buffer;
  }

  start(type: string) {
    if (this.isPlaying) return;

    this.initContext();
    const ctx = this.audioContext!;

    const buffer = this.createNoiseBuffer(type);

    this.sourceNode = ctx.createBufferSource();
    this.sourceNode.buffer = buffer;
    this.sourceNode.loop = true;

    this.filterNode = ctx.createBiquadFilter();
    if (type === 'rain') {
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 2000;
    } else if (type === 'fire') {
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 800;
    } else {
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.value = 1000;
      this.filterNode.Q.value = 0.5;
    }

    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = this.volume;

    this.sourceNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);

    this.sourceNode.start();
    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;

    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.filterNode) {
      this.filterNode.disconnect();
      this.filterNode = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    this.isPlaying = false;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.isPlaying) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext!.currentTime);
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

const ambientSounds: AmbientSound[] = [
  {
    id: 'rain',
    name: '雨声',
    icon: '🌧️',
    audioUrl: '',
  },
  {
    id: 'cafe',
    name: '咖啡馆',
    icon: '☕',
    audioUrl: '',
  },
  {
    id: 'fire',
    name: '篝火',
    icon: '🔥',
    audioUrl: '',
  },
];

interface SoundPlayerProps {
  sound: AmbientSound;
}

const SoundPlayer: React.FC<SoundPlayerProps> = ({ sound }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const noiseGeneratorRef = useRef<NoiseGenerator | null>(null);

  useEffect(() => {
    noiseGeneratorRef.current = new NoiseGenerator();
    return () => {
      if (noiseGeneratorRef.current) {
        noiseGeneratorRef.current.stop();
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (!noiseGeneratorRef.current) return;

    if (isPlaying) {
      noiseGeneratorRef.current.stop();
      setIsPlaying(false);
    } else {
      noiseGeneratorRef.current.start(sound.id);
      noiseGeneratorRef.current.setVolume(volume);
      setIsPlaying(true);
    }
  }, [isPlaying, sound.id, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (noiseGeneratorRef.current) {
      noiseGeneratorRef.current.setVolume(newVolume);
    }
    if (newVolume === 0 && isPlaying && noiseGeneratorRef.current) {
      noiseGeneratorRef.current.stop();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return (
    <motion.div
      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
        isPlaying ? 'bg-gray-100 shadow-md' : 'bg-white hover:bg-gray-50'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <motion.button
        onClick={togglePlay}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
          isPlaying
            ? 'bg-break text-white shadow-lg'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
        whileTap={{ scale: 0.9 }}
      >
        {sound.icon}
      </motion.button>

      <p className="mt-2 text-xs font-medium text-gray-700 truncate w-full text-center">
        {sound.name}
      </p>

      <div className="mt-2 w-full flex items-center gap-1">
        <svg
          className="w-3 h-3 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-break min-w-0"
          style={{
            WebkitAppearance: 'none',
          }}
        />
        <span className="text-xs text-gray-500 flex-shrink-0 w-6 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </motion.div>
  );
};

const AmbientSoundPlayer: React.FC = () => {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-5 max-w-md w-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>🎧</span>
        环境白噪音
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {ambientSounds.map((sound) => (
          <SoundPlayer key={sound.id} sound={sound} />
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-400 text-center">
        点击图标播放/暂停，滑动调整音量
      </p>
    </motion.div>
  );
};

export default AmbientSoundPlayer;
