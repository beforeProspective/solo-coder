import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerMode } from '../types';
import CircularProgress from './CircularProgress';

interface TimerProps {
  onTimerComplete: (mode: TimerMode) => void;
  mode: TimerMode;
  setMode: (mode: TimerMode) => void;
}

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const Timer: React.FC<TimerProps> = ({ onTimerComplete, mode, setMode }) => {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);

  const totalTime = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - ${mode === 'focus' ? '专注' : '休息'}`;
    return () => {
      document.title = '番茄钟 - Pomodoro Timer';
    };
  }, [timeLeft, mode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      onTimerComplete(mode);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, onTimerComplete]);

  useEffect(() => {
    setTimeLeft(totalTime);
    setIsRunning(false);
  }, [mode, totalTime]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeLeft(totalTime);
    setIsRunning(false);
  }, [totalTime]);

  const primaryColor = mode === 'focus' ? '#FF6B6B' : '#4ECDC4';
  const bgColor = mode === 'focus' ? 'bg-focus/10' : 'bg-break/10';

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex gap-4 mb-8">
        <motion.button
          onClick={() => setMode('focus')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            mode === 'focus'
              ? 'bg-focus text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          专注模式
        </motion.button>
        <motion.button
          onClick={() => setMode('break')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            mode === 'break'
              ? 'bg-break text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          休息模式
        </motion.button>
      </div>

      <div className={`relative ${bgColor} rounded-full p-8`}>
        <CircularProgress progress={progress} color={primaryColor} />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={timeLeft}
              className="text-6xl font-bold text-gray-800"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {formatTime(timeLeft)}
            </motion.div>
          </AnimatePresence>
          <motion.p
            className="mt-2 text-lg font-medium"
            style={{ color: primaryColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {mode === 'focus' ? '专注时间' : '休息时间'}
          </motion.p>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <motion.button
          onClick={toggleTimer}
          className="px-8 py-3 rounded-full font-semibold text-white shadow-lg transition-all"
          style={{ backgroundColor: primaryColor }}
          whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)' }}
          whileTap={{ scale: 0.95 }}
        >
          {isRunning ? '暂停' : '开始'}
        </motion.button>
        <motion.button
          onClick={resetTimer}
          className="px-8 py-3 rounded-full font-semibold text-gray-600 bg-gray-100 shadow-lg hover:bg-gray-200 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          重置
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Timer;
