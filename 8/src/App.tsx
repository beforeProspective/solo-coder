import React, { useState, useEffect, useRef } from 'react';
import TemperatureChart from './components/TemperatureChart';
import RainfallChart from './components/RainfallChart';
import ControlPanel from './components/ControlPanel';
import WeatherOverview from './components/WeatherOverview';
import { generateWeatherData } from './data/weatherData';

const App: React.FC = () => {
  const [allWeatherData] = useState(() => generateWeatherData(22, 7));
  const [currentDay, setCurrentDay] = useState(0);
  const [currentHour, setCurrentHour] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentData = allWeatherData[currentDay];
  const currentDataPoint = currentData[currentHour];

  useEffect(() => {
    if (isPlaying) {
      const interval = 1000 / playSpeed;
      
      playIntervalRef.current = setInterval(() => {
        setCurrentHour(prev => {
          if (prev >= 23) {
            setCurrentDay(prevDay => {
              if (prevDay >= allWeatherData.length - 1) {
                setIsPlaying(false);
                return 0;
              }
              return prevDay + 1;
            });
            return 0;
          }
          return prev + 1;
        });
      }, interval);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, playSpeed, allWeatherData.length]);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentDay(0);
    setCurrentHour(0);
  };

  const handleHourChange = (hour: number) => {
    setCurrentHour(hour);
  };

  const handleDayChange = (day: number) => {
    setCurrentDay(day);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaySpeed(speed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-block p-4 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl mb-6">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🌤️ 天气可视化仪表板
            </h1>
            <p className="text-xl text-gray-600 mt-3 font-medium">
              实时温度与降雨量数据可视化展示
            </p>
          </div>
        </header>

        <main className="space-y-8">
          <section>
            <WeatherOverview 
              data={currentDataPoint} 
              day={currentDay}
            />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <section>
                <TemperatureChart 
                  data={currentData} 
                  currentHour={currentHour}
                  title={`第${currentDay + 1}天温度变化趋势`}
                />
              </section>

              <section>
                <RainfallChart 
                  data={currentData} 
                  currentHour={currentHour}
                  title={`第${currentDay + 1}天降雨量变化趋势`}
                />
              </section>
            </div>

            <div className="xl:col-span-1">
              <section className="sticky top-8">
                <ControlPanel
                  currentHour={currentHour}
                  totalHours={24}
                  isPlaying={isPlaying}
                  playSpeed={playSpeed}
                  currentDay={currentDay}
                  totalDays={allWeatherData.length}
                  onHourChange={handleHourChange}
                  onPlayToggle={handlePlayToggle}
                  onSpeedChange={handleSpeedChange}
                  onDayChange={handleDayChange}
                  onReset={handleReset}
                />
              </section>
            </div>
          </div>

          <section className="card p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 数据说明</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-2">温度数据</h4>
                <p className="text-sm text-gray-600">
                  模拟了一天24小时的温度变化，基于正弦曲线模拟自然温度波动，并添加了随机变化。温度范围通常在15°C到30°C之间。
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-2">降雨量数据</h4>
                <p className="text-sm text-gray-600">
                  模拟了一天24小时的降雨量变化，主要集中在白天和傍晚时段。降雨量单位为毫米，范围从0到20mm不等。
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-2">交互功能</h4>
                <p className="text-sm text-gray-600">
                  支持播放/暂停动画、时间滑块控制、日期切换、播放速度调节等功能。播放时会自动遍历所有小时和日期数据。
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-2">视觉效果</h4>
                <p className="text-sm text-gray-600">
                  采用渐变色背景、毛玻璃效果卡片、彩色数据映射、平滑动画过渡等现代UI设计，在桌面宽屏下布局整齐美观。
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-12 text-center text-gray-600">
          <div className="inline-block p-4 bg-white/60 backdrop-blur rounded-2xl">
            <p className="text-sm">
              🚀 使用 React + TypeScript + Tailwind CSS + Recharts 构建
            </p>
            <p className="text-xs mt-1 text-gray-500">
              天气数据为模拟数据，仅供演示可视化效果
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
