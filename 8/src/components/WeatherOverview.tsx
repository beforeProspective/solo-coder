import React from 'react';
import { WeatherDataPoint, getTemperatureColor, getRainfallColor, getHumidityColor, getWindSpeedColor } from '../data/weatherData';

interface WeatherOverviewProps {
  data: WeatherDataPoint;
  day: number;
}

const WeatherOverview: React.FC<WeatherOverviewProps> = ({ data, day }) => {
  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDay = (day: number) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `第${day + 1}天, ${days[(day + 1) % 7]}`;
  };

  const getWeatherCondition = () => {
    if (data.rainfall > 10) return { text: '大雨', icon: '🌧️', color: 'text-blue-700' };
    if (data.rainfall > 5) return { text: '中雨', icon: '🌦️', color: 'text-blue-500' };
    if (data.rainfall > 1) return { text: '小雨', icon: '🌥️', color: 'text-blue-400' };
    if (data.temperature > 30) return { text: '炎热', icon: '☀️', color: 'text-orange-500' };
    if (data.temperature > 25) return { text: '温暖', icon: '🌤️', color: 'text-yellow-500' };
    if (data.temperature > 15) return { text: '舒适', icon: '⛅', color: 'text-green-500' };
    if (data.temperature > 10) return { text: '凉爽', icon: '🌥️', color: 'text-cyan-500' };
    return { text: '寒冷', icon: '❄️', color: 'text-blue-500' };
  };

  const weatherCondition = getWeatherCondition();

  return (
    <div className="card p-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
        <div className="text-center lg:text-left">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">天气状况</h2>
          <p className="text-xl text-gray-600">{formatDay(day)}</p>
          <p className="text-2xl font-bold text-primary mt-2">{formatTime(data.hour)}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-8xl">{weatherCondition.icon}</div>
          <div>
            <p className={`text-3xl font-bold ${weatherCondition.color}`}>{weatherCondition.text}</p>
            <div 
              className="mt-2 px-6 py-3 rounded-2xl text-white text-4xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
              style={{ backgroundColor: getTemperatureColor(data.temperature) }}
            >
              {data.temperature}°C
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">💧</div>
            <div>
              <p className="text-sm text-gray-600 font-medium">降雨量</p>
              <p 
                className="text-2xl font-bold"
                style={{ color: getRainfallColor(data.rainfall) }}
              >
                {data.rainfall} mm
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, data.rainfall * 5)}%`,
                backgroundColor: getRainfallColor(data.rainfall)
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">💨</div>
            <div>
              <p className="text-sm text-gray-600 font-medium">风速</p>
              <p 
                className="text-2xl font-bold"
                style={{ color: getWindSpeedColor(data.windSpeed) }}
              >
                {data.windSpeed} m/s
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, data.windSpeed * 4)}%`,
                backgroundColor: getWindSpeedColor(data.windSpeed)
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">🌡️</div>
            <div>
              <p className="text-sm text-gray-600 font-medium">湿度</p>
              <p 
                className="text-2xl font-bold"
                style={{ color: getHumidityColor(data.humidity) }}
              >
                {data.humidity}%
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full transition-all duration-500"
              style={{ 
                width: `${data.humidity}%`,
                backgroundColor: getHumidityColor(data.humidity)
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">⏰</div>
            <div>
              <p className="text-sm text-gray-600 font-medium">当前小时</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatTime(data.hour)}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-secondary"
              style={{ 
                width: `${(data.hour / 23) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherOverview;
