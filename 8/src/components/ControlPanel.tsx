import React from 'react';

interface ControlPanelProps {
  currentHour: number;
  totalHours: number;
  isPlaying: boolean;
  playSpeed: number;
  currentDay: number;
  totalDays: number;
  onHourChange: (hour: number) => void;
  onPlayToggle: () => void;
  onSpeedChange: (speed: number) => void;
  onDayChange: (day: number) => void;
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  currentHour,
  totalHours,
  isPlaying,
  playSpeed,
  currentDay,
  totalDays,
  onHourChange,
  onPlayToggle,
  onSpeedChange,
  onDayChange,
  onReset,
}) => {
  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDay = (day: number) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `第${day + 1}天 (${days[(day + 1) % 7]})`;
  };

  return (
    <div className="card p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">控制面板</h3>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-lg font-semibold text-gray-700">当前时间</label>
            <span className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-lg">
              {formatTime(currentHour)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={totalHours - 1}
            value={currentHour}
            onChange={(e) => onHourChange(parseInt(e.target.value))}
            className="slider w-full"
            disabled={isPlaying}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:00</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-lg font-semibold text-gray-700">当前日期</label>
            <span className="px-4 py-2 bg-gradient-to-r from-weather-blue to-weather-purple text-white rounded-xl font-bold shadow-lg">
              {formatDay(currentDay)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={totalDays - 1}
            value={currentDay}
            onChange={(e) => onDayChange(parseInt(e.target.value))}
            className="slider w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>第1天</span>
            <span>第4天</span>
            <span>第{totalDays}天</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-lg font-semibold text-gray-700">播放速度</label>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold">
              {playSpeed}x
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[0.5, 1, 2, 3, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${playSpeed === speed ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onPlayToggle}
            className={`flex-1 min-w-[120px] btn flex items-center justify-center gap-2 ${isPlaying ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'btn-primary'}`}
          >
            <span className="text-xl">{isPlaying ? '⏸️' : '▶️'}</span>
            <span className="font-bold">{isPlaying ? '暂停' : '播放'}</span>
          </button>
          
          <button
            onClick={onReset}
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            <span className="text-xl">🔄</span>
            <span className="font-bold">重置</span>
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onHourChange(Math.max(0, currentHour - 1))}
            className="btn btn-secondary flex-1 min-w-[80px]"
            disabled={currentHour <= 0}
          >
            ⬅️ 上一小时
          </button>
          
          <button
            onClick={() => onHourChange(Math.min(totalHours - 1, currentHour + 1))}
            className="btn btn-secondary flex-1 min-w-[80px]"
            disabled={currentHour >= totalHours - 1}
          >
            下一小时 ➡️
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onDayChange(Math.max(0, currentDay - 1))}
            className="btn btn-secondary flex-1 min-w-[80px]"
            disabled={currentDay <= 0}
          >
            ⬅️ 前一天
          </button>
          
          <button
            onClick={() => onDayChange(Math.min(totalDays - 1, currentDay + 1))}
            className="btn btn-secondary flex-1 min-w-[80px]"
            disabled={currentDay >= totalDays - 1}
          >
            后一天 ➡️
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
