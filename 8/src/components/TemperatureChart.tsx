import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceDot } from 'recharts';
import { WeatherDataPoint, getTemperatureColor } from '../data/weatherData';

interface TemperatureChartProps {
  data: WeatherDataPoint[];
  currentHour: number;
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const temp = payload[0].value;
    const color = getTemperatureColor(temp);
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-white/50">
        <p className="text-gray-700 font-semibold mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          ></div>
          <p className="text-gray-800">
            温度: <span className="font-bold text-lg" style={{ color }}>{temp}°C</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const TemperatureChart: React.FC<TemperatureChartProps> = ({ data, currentHour, title = "24小时温度变化" }) => {
  const currentDataPoint = data[currentHour];
  const currentTemp = currentDataPoint?.temperature || 0;
  const currentTempColor = getTemperatureColor(currentTemp);

  const getGradientId = () => {
    return `tempGradient-${Math.random().toString(36).substr(2, 9)}`;
  };

  const gradientId = getGradientId();

  return (
    <div className="card p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <div 
          className="px-4 py-2 rounded-xl font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-300"
          style={{ backgroundColor: currentTempColor }}
        >
          当前: {currentTemp}°C
        </div>
      </div>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentTempColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={currentTempColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              unit="°C"
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Area 
              type="monotone" 
              dataKey="temperature" 
              stroke={currentTempColor} 
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              name="温度 (°C)"
              animationDuration={500}
            />
            {currentDataPoint && (
              <ReferenceDot
                x={currentDataPoint.time}
                y={currentDataPoint.temperature}
                r={8}
                fill="white"
                stroke={currentTempColor}
                strokeWidth={3}
                isFront={true}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-700">温度色阶参考</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { temp: '< 5°C', color: '#6366f1', label: '寒冷' },
            { temp: '5-10°C', color: '#3b82f6', label: '凉爽' },
            { temp: '10-15°C', color: '#06b6d4', label: '舒适' },
            { temp: '15-20°C', color: '#10b981', label: '温和' },
            { temp: '20-25°C', color: '#84cc16', label: '温暖' },
            { temp: '25-30°C', color: '#f59e0b', label: '炎热' },
            { temp: '30-35°C', color: '#f97316', label: '酷热' },
            { temp: '> 35°C', color: '#ef4444', label: '极端' },
          ].map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div 
                className="w-4 h-4 rounded-full shadow-sm"
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="text-xs">
                <span className="font-semibold text-gray-700">{item.temp}</span>
                <span className="text-gray-500 ml-1">({item.label})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemperatureChart;
