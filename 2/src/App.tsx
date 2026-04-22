import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerMode } from './types';
import Timer from './components/Timer';
import TodoList from './components/TodoList';
import AmbientSoundPlayer from './components/AmbientSoundPlayer';

function App() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showNotificationHint, setShowNotificationHint] = useState(true);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      setShowNotificationHint(false);
    }
  };

  const sendNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '⏰',
        badge: '⏰',
      });
    }
  }, []);

  const handleTimerComplete = useCallback(
    (completedMode: TimerMode) => {
      if (completedMode === 'focus') {
        sendNotification(
          '专注时间结束！',
          '25分钟专注已完成，开始5分钟休息吧！'
        );
        setMode('break');
      } else {
        sendNotification(
          '休息时间结束！',
          '5分钟休息已完成，准备好开始下一轮专注了吗？'
        );
        setMode('focus');
      }
    },
    [sendNotification]
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      mode === 'focus'
        ? 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50'
        : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50'
    }`}>
      <AnimatePresence>
        {showNotificationHint && notificationPermission === 'default' && (
          <motion.div
            className="fixed top-4 right-4 bg-white rounded-xl shadow-lg p-4 max-w-sm z-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔔</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">启用通知</p>
                <p className="text-xs text-gray-500 mt-1">
                  计时结束时接收系统通知，不错过每一次休息
                </p>
                <div className="flex gap-2 mt-3">
                  <motion.button
                    onClick={requestNotificationPermission}
                    className="px-3 py-1.5 text-xs font-medium bg-focus text-white rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    启用通知
                  </motion.button>
                  <motion.button
                    onClick={() => setShowNotificationHint(false)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                    whileTap={{ scale: 0.95 }}
                  >
                    稍后再说
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        className="pt-8 pb-4 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span>🍅</span>
          番茄钟
          <span className="text-sm font-normal text-gray-500">Pomodoro Timer</span>
        </h1>
      </motion.header>

      <main className="container mx-auto px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Timer
              mode={mode}
              setMode={setMode}
              onTimerComplete={handleTimerComplete}
            />
          </motion.div>

          <div className="flex flex-col gap-6 w-full lg:w-auto">
            <TodoList />
            <AmbientSoundPlayer />
          </div>
        </div>
      </main>

      <motion.footer
        className="text-center py-6 text-gray-400 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>专注25分钟，休息5分钟 · 高效工作，健康生活</p>
      </motion.footer>
    </div>
  );
}

export default App;
