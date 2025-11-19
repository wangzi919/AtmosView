import React, { useState, useEffect, useMemo } from 'react';
import WeatherScene from './components/WeatherScene';
import Mascot from './components/Mascot';
import Timeline from './components/Timeline';
import DataPanel from './components/DataPanel';
import LocationSearch from './components/LocationSearch';
import { WeatherData, WeatherCondition, HourlyForecast } from './types';
import { fetchWeather } from './services/weatherService';

const App: React.FC = () => {
  const [landingMode, setLandingMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);

  // Start interactive flow
  const handleStart = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleSearch(`${latitude},${longitude}`);
        },
        (error) => {
          console.warn("Geolocation blocked, defaulting to London", error);
          handleSearch("London");
        }
      );
    } else {
      handleSearch("London");
    }
  };

  const handleSearch = async (location: string) => {
    setLoading(true);
    try {
      const data = await fetchWeather(location);
      setWeatherData(data);
      setSliderIndex(0);
      setLandingMode(false);
    } catch (err) {
      alert("Failed to fetch weather. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Derived state for current view based on slider
  const currentViewData: HourlyForecast | undefined = useMemo(() => {
    if (!weatherData) return undefined;
    return weatherData.hourly[sliderIndex];
  }, [weatherData, sliderIndex]);

  // Determine Mascot Mood based on weather
  const mascotMood = useMemo(() => {
    if (!currentViewData) return 'happy';
    const c = currentViewData.condition;
    if (c === WeatherCondition.Rainy || c === WeatherCondition.Stormy) return 'sad';
    if (c === WeatherCondition.Sunny) return 'excited';
    
    // Check time for sleepy mood (simplified logic)
    const hour = parseInt(currentViewData.time.split(':')[0]);
    if (hour >= 22 || hour <= 6) return 'sleepy';

    return 'happy';
  }, [currentViewData]);

  // Determine Day/Night for background
  const isDay = useMemo(() => {
    if (!currentViewData) return true;
    const hour = parseInt(currentViewData.time.split(':')[0]);
    return hour >= 6 && hour < 20;
  }, [currentViewData]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900 text-slate-800">
      
      {/* 1. Background Layer */}
      <WeatherScene 
        condition={currentViewData?.condition || WeatherCondition.Sunny} 
        isDay={isDay}
      />

      {/* 2. UI Overlay Layer */}
      <div className="absolute inset-0 z-10 flex flex-col h-full">
        
        {/* Header / Search */}
        <header className="p-6 flex justify-between items-start">
          {!landingMode && (
            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="text-white">
                  <h1 className="text-3xl font-bold drop-shadow-md">{weatherData?.location}</h1>
                  <p className="text-sm opacity-80">Weather data by Open-Meteo</p>
               </div>
               <LocationSearch onSearch={handleSearch} isLoading={loading} />
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
            
            {/* Landing Page View */}
            {landingMode && (
                <div className="text-center text-white animate-[fade-in_1s_ease-out]">
                    <h1 className="text-6xl font-extrabold mb-8 drop-shadow-lg tracking-tight">AtmosView</h1>
                    <div className="mb-12 flex justify-center">
                         <Mascot 
                            condition={WeatherCondition.Sunny} 
                            mood="excited" 
                            size="lg" 
                            onClick={handleStart}
                            className="cursor-pointer"
                         />
                    </div>
                    <button 
                        onClick={handleStart}
                        className="px-8 py-4 bg-white text-blue-600 text-xl font-bold rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition-all transform"
                    >
                        {loading ? "Forecasting..." : "Check Forecast"}
                    </button>
                    <p className="mt-4 text-blue-100 opacity-80">Click Feifei or the button to start</p>
                </div>
            )}

            {/* Dashboard View */}
            {!landingMode && currentViewData && (
                <div className="w-full max-w-4xl flex flex-col gap-6 animate-[slide-up_0.5s_ease-out]">
                    
                    {/* Top Section: Mascot + Main Temp */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                         <Mascot 
                            condition={currentViewData.condition} 
                            mood={mascotMood} 
                            size="md" 
                            className="hidden md:block"
                         />
                         <DataPanel data={currentViewData} />
                    </div>

                    {/* Bottom Section: Timeline */}
                    <div className="mt-auto">
                        <Timeline 
                            hourlyData={weatherData!.hourly} 
                            selectedIndex={sliderIndex} 
                            onIndexChange={setSliderIndex}
                        />
                    </div>
                    
                    {/* Sources Footer */}
                    {weatherData?.sources && weatherData.sources.length > 0 && (
                      <div className="mt-4 p-2 bg-black/30 rounded text-xs text-white/70 max-w-full overflow-hidden text-center">
                        Sources: {weatherData.sources.map((s, i) => (
                          <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="underline mr-2 hover:text-white">{s.title}</a>
                        ))}
                      </div>
                    )}

                </div>
            )}
        </main>
      </div>
      
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default App;