// Weather API integration
const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherResponse {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  location: string;
}

export const getCurrentWeather = async (latitude: number, longitude: number): Promise<WeatherResponse> => {
  try {
    if (!WEATHER_API_KEY) {
      // Return mock data if no API key is provided
      return getMockWeatherData();
    }

    const response = await fetch(
      `${WEATHER_API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      rainfall: data.rain?.['1h'] || 0,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      condition: data.weather[0].main,
      location: data.name,
    };
  } catch (error) {
    console.error('Weather API error:', error);
    // Fallback to mock data
    return getMockWeatherData();
  }
};

export const getWeatherForecast = async (latitude: number, longitude: number, days: number = 5): Promise<WeatherResponse[]> => {
  try {
    if (!WEATHER_API_KEY) {
      return getMockForecastData(days);
    }

    const response = await fetch(
      `${WEATHER_API_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&cnt=${days * 8}` // 8 forecasts per day (3-hour intervals)
    );

    if (!response.ok) {
      throw new Error('Weather forecast API request failed');
    }

    const data = await response.json();

    // Group by day and take the midday forecast
    const dailyForecasts: WeatherResponse[] = [];
    for (let i = 0; i < days; i++) {
      const dayData = data.list[i * 8 + 4]; // Midday forecast
      if (dayData) {
        dailyForecasts.push({
          temperature: Math.round(dayData.main.temp),
          humidity: dayData.main.humidity,
          rainfall: dayData.rain?.['3h'] || 0,
          windSpeed: Math.round(dayData.wind.speed * 3.6),
          condition: dayData.weather[0].main,
          location: data.city.name,
        });
      }
    }

    return dailyForecasts;
  } catch (error) {
    console.error('Weather forecast API error:', error);
    return getMockForecastData(days);
  }
};

// Mock data for development/fallback
const getMockWeatherData = (): WeatherResponse => {
  const conditions = ['Clear', 'Clouds', 'Rain', 'Sunny'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    temperature: Math.round(Math.random() * 15 + 20), // 20-35°C
    humidity: Math.round(Math.random() * 40 + 40), // 40-80%
    rainfall: randomCondition === 'Rain' ? Math.round(Math.random() * 10) : 0,
    windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
    condition: randomCondition,
    location: 'Current Location',
  };
};

const getMockForecastData = (days: number): WeatherResponse[] => {
  const forecasts: WeatherResponse[] = [];
  
  for (let i = 0; i < days; i++) {
    forecasts.push(getMockWeatherData());
  }
  
  return forecasts;
};

// Location utilities
export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const Location = await import('expo-location');
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Location error:', error);
    return null;
  }
};