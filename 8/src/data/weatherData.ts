export interface WeatherDataPoint {
  time: string;
  hour: number;
  temperature: number;
  rainfall: number;
  humidity: number;
  windSpeed: number;
}

export const generateWeatherData = (baseTemp: number = 20, days: number = 7): WeatherDataPoint[][] => {
  const allDaysData: WeatherDataPoint[][] = [];
  
  for (let day = 0; day < days; day++) {
    const dayData: WeatherDataPoint[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const dayVariation = Math.sin(day / days * Math.PI * 2) * 5;
      const hourVariation = Math.sin((hour - 6) / 24 * Math.PI * 2) * 8;
      const randomVariation = (Math.random() - 0.5) * 2;
      
      const temperature = Math.round((baseTemp + dayVariation + hourVariation + randomVariation) * 10) / 10;
      
      let rainfall = 0;
      if (hour >= 10 && hour <= 16) {
        rainfall = Math.max(0, Math.sin((hour - 10) / 6 * Math.PI) * 20 + (Math.random() - 0.5) * 10);
      } else if (hour >= 18 && hour <= 22) {
        rainfall = Math.max(0, Math.sin((hour - 18) / 4 * Math.PI) * 15 + (Math.random() - 0.5) * 8);
      } else {
        rainfall = Math.max(0, (Math.random() - 0.3) * 5);
      }
      rainfall = Math.round(rainfall * 10) / 10;
      
      const humidity = Math.round(60 + (Math.random() - 0.5) * 20 + rainfall * 0.5);
      const windSpeed = Math.round((10 + (Math.random() - 0.5) * 8) * 10) / 10;
      
      dayData.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour,
        temperature,
        rainfall,
        humidity,
        windSpeed,
      });
    }
    
    allDaysData.push(dayData);
  }
  
  return allDaysData;
};

export const getTemperatureColor = (temp: number): string => {
  if (temp < 5) return '#6366f1';
  if (temp < 10) return '#3b82f6';
  if (temp < 15) return '#06b6d4';
  if (temp < 20) return '#10b981';
  if (temp < 25) return '#84cc16';
  if (temp < 30) return '#f59e0b';
  if (temp < 35) return '#f97316';
  return '#ef4444';
};

export const getRainfallColor = (rainfall: number): string => {
  if (rainfall < 1) return '#e0f2fe';
  if (rainfall < 5) return '#7dd3fc';
  if (rainfall < 10) return '#38bdf8';
  if (rainfall < 15) return '#0ea5e9';
  if (rainfall < 20) return '#0284c7';
  return '#0369a1';
};

export const getWindSpeedColor = (speed: number): string => {
  if (speed < 5) return '#4ade80';
  if (speed < 10) return '#86efac';
  if (speed < 15) return '#fbbf24';
  if (speed < 20) return '#f97316';
  return '#ef4444';
};

export const getHumidityColor = (humidity: number): string => {
  if (humidity < 30) return '#fde68a';
  if (humidity < 50) return '#fcd34d';
  if (humidity < 70) return '#93c5fd';
  if (humidity < 90) return '#60a5fa';
  return '#3b82f6';
};
