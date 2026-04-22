import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine, ComposedChart, Area } from 'recharts';
import { WeatherDataPoint, getRainfallColor } from '../data/weatherData';

interface RainfallChartProps {
  data: WeatherDataPoint[];
  currentHour: number;
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const rainfall = payload[0].value;
    const color = getRainfallColor(rainfall);
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-white/50">
        <p className="text-gray-700 font-semibold mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          ></div>
          <p className="text-gray-800">
            降雨量: <span className="font-bold text-lg" style={{ color }}>{rainfall} mm</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const RainfallChart: React.FC<RainfallChartProps> = ({ data, currentHour, title = "24小时降雨量变化" }) => {
  const currentDataPoint = data[currentHour];
  const currentRainfall = currentDataPoint?.rainfall || 0;
  const currentRainfallColor = getRainfallColor(currentRainfall);

  const getGradientId = () => {
    return `rainfallGradient-${Math.random().toString(36).substr(2, 9)}`;
  };

  const gradientId = getGradientId();

  const calculateTotalRainfall = () => {
    return data.reduce((sum, item) => sum + item.rainfall, 0);
  };

  const totalRainfall = calculateTotalRainfall();
  const avgRainfall = totalRainfall / data.length;

  return (
    <div className="card p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <div className="flex gap-3">
          <div 
            className="px-4 py-2 rounded-xl font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: currentRainfallColor }}
          >
            当前: {currentRainfall} mm
          </div>
          <div className="px-4 py-2 rounded-xl font-bold bg-blue-50 text-blue-700 shadow-sm">
            总计: {totalRainfall.toFixed(1)} mm
          </div>
        </div>
      </div>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                <stop offset="100%" stopColor="#0369a1" stopOpacity={0.4}/>
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
              unit=" mm"
              domain={[0, 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar 
              dataKey="rainfall" 
              radius={[4, 4, 0, 0]}
              name="降雨量 (mm)"
              animationDuration={500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getRainfallColor(entry.rainfall)}
                  opacity={index === currentHour ? 1 : 0.7}
                  stroke={index === currentHour ? "#1e40af" : "transparent"}
                  strokeWidth={index === currentHour ? 2 : 0}
                />
              ))}
            </Bar>
            <ReferenceLine 
              y={avgRainfall} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              label={{ 
                position: 'right', 
                value: `平均值: ${avgRainfall.toFixed(1)} mm`,
                fill: '#ef4444',
                fontSize: 12,
                fontWeight: 'bold'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="rainfall" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="transparent"
              strokeDasharray="3 3"
              opacity={0.5}
              name="趋势线"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-700">降雨量色阶参考</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { rainfall: '< 1 mm', color: '#e0f2fe', label: '无雨' },
            { rainfall: '1-5 mm', color: '#7dd3fc', label: '小雨' },
            { rainfall: '5-10 mm', color: '#38bdf8', label: '中雨' },
            { rainfall: '10-15 mm', color: '#0ea5e9', label: '大雨' },
            { rainfall: '15-20 mm', color: '#0284c7', label: '暴雨' },
            { rainfall: '> 20 mm', color: '#0369a1', label: '大暴雨' },
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
                <span className="font-semibold text-gray-700">{item.rainfall}</span>
                <span className="text-gray-500 ml-1">({item.label})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RainfallChart;
