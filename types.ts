export enum WeatherCondition {
  Sunny = 'Sunny',
  Cloudy = 'Cloudy',
  Rainy = 'Rainy',
  Snowy = 'Snowy',
  Stormy = 'Stormy',
  Clear = 'Clear',
}

export interface HourlyForecast {
  time: string; // "14:00"
  temp: number; // Celsius
  condition: WeatherCondition;
  humidity: number; // %
  windSpeed: number; // km/h
  description: string;
}

export interface WeatherData {
  location: string;
  current: HourlyForecast;
  hourly: HourlyForecast[]; // 24 items
  sources?: { title: string; uri: string }[]; // For citation
}

export interface MascotProps {
  condition: WeatherCondition;
  mood: 'happy' | 'sad' | 'sleepy' | 'excited' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export interface SceneProps {
  condition: WeatherCondition;
  isDay: boolean;
}
