import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useAuthStore } from '@/hooks/useAuth';
import { useAppStore } from '@/hooks/useApp';
import { useCustomAlert } from '@/components/ui/CustomAlert';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';

interface CurrentWeather {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
}

export default function WeatherScreen() {
  const { user } = useAuthStore();
  const { weatherData, fetchWeatherData, addWeatherData } = useAppStore();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);

  const getCurrentLocation = useCallback(async () => {
    try {
      // In a real app, you would fetch weather data from a weather API here
      // For demo purposes, we'll simulate weather data
      simulateCurrentWeather();
    } catch (error) {
      console.error('Error getting location:', error);
      showAlert({
        title: 'Error',
        message: 'Unable to get current location',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    }
  }, [showAlert]);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        showAlert({
          title: 'Location Permission',
          message: 'Location permission is needed to get current weather data.',
          type: 'warning',
          buttons: [
            { text: 'Cancel', style: 'cancel', onPress: () => {} },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ],
        });
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  }, [getCurrentLocation, showAlert]);

  useEffect(() => {
    if (user) {
      fetchWeatherData(user.id);
      requestLocationPermission();
    }
  }, [user, fetchWeatherData, requestLocationPermission]);

  const simulateCurrentWeather = () => {
    // Simulate current weather data
    const conditions = ['sunny', 'cloudy', 'rainy', 'partly_cloudy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    setCurrentWeather({
      temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
      condition: randomCondition,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
      pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
      uvIndex: Math.floor(Math.random() * 10) + 1, // 1-10
      visibility: Math.floor(Math.random() * 5) + 5, // 5-10 km
    });
  };

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchWeatherData(user.id);
    if (locationPermission) {
      await getCurrentLocation();
    }
    setRefreshing(false);
  };

  const saveCurrentWeather = async () => {
    if (!user || !currentWeather) return;

    const weatherRecord = {
      user_id: user.id,
      location: 'Current Location', // Would be fetched from location API
      temperature: currentWeather.temperature,
      humidity: currentWeather.humidity,
      rainfall: 0, // Would be fetched from weather API
      wind_speed: currentWeather.windSpeed,
      weather_condition: currentWeather.condition,
      recorded_at: new Date().toISOString(),
      notes: 'Automatically recorded weather data',
    };

    const result = await addWeatherData(weatherRecord);
    if (result.error) {
      showAlert({
        title: 'Error',
        message: 'Failed to save weather data',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    } else {
      showAlert({
        title: 'Success',
        message: 'Weather data saved successfully',
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    }
  };

  const getWeatherIcon = (condition: string): string => {
    switch (condition) {
      case 'sunny': return 'sunny-outline';
      case 'cloudy': return 'cloudy-outline';
      case 'rainy': return 'rainy-outline';
      case 'partly_cloudy': return 'partly-sunny-outline';
      case 'stormy': return 'thunderstorm-outline';
      case 'snowy': return 'snow-outline';
      default: return 'cloud-outline';
    }
  };

  const getWeatherGradient = (condition: string): string[] => {
    switch (condition) {
      case 'sunny': return ['#FFD700', '#FFA500'];
      case 'cloudy': return ['#87CEEB', '#708090'];
      case 'rainy': return ['#4682B4', '#2F4F4F'];
      case 'partly_cloudy': return ['#87CEEB', '#FFD700'];
      case 'stormy': return ['#2F4F4F', '#000000'];
      default: return [Colors.light.primary, Colors.light.secondary];
    }
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp < 10) return Colors.light.info;
    if (temp < 25) return Colors.light.success;
    if (temp < 35) return Colors.light.warning;
    return Colors.light.error;
  };

  const getUVIndexColor = (uv: number): string => {
    if (uv <= 2) return Colors.light.success;
    if (uv <= 5) return Colors.light.warning;
    if (uv <= 7) return '#FF8C00';
    if (uv <= 10) return Colors.light.error;
    return '#8B008B';
  };

  const getUVIndexLabel = (uv: number): string => {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons 
            name="refresh-outline" 
            size={24} 
            color={Colors.light.background}
            style={refreshing ? { opacity: 0.5 } : {}}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Current Weather Card */}
        {currentWeather && (
          <Animatable.View animation="fadeInDown" style={styles.currentWeatherContainer}>
            <LinearGradient
              colors={getWeatherGradient(currentWeather.condition) as [string, string]}
              style={styles.currentWeatherCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.currentWeatherHeader}>
                <View style={styles.weatherIconContainer}>
                  <Ionicons
                    name={getWeatherIcon(currentWeather.condition) as any}
                    size={64}
                    color={Colors.light.background}
                  />
                </View>
                <View style={styles.temperatureContainer}>
                  <Text style={styles.temperature}>{currentWeather.temperature}°C</Text>
                  <Text style={styles.condition}>
                    {currentWeather.condition?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                  </Text>
                </View>
              </View>

              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="water-outline" size={20} color={Colors.light.background} />
                  <Text style={styles.weatherDetailLabel}>Humidity</Text>
                  <Text style={styles.weatherDetailValue}>{currentWeather.humidity}%</Text>
                </View>
                
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="speedometer-outline" size={20} color={Colors.light.background} />
                  <Text style={styles.weatherDetailLabel}>Wind</Text>
                  <Text style={styles.weatherDetailValue}>{currentWeather.windSpeed} km/h</Text>
                </View>
                
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="barbell-outline" size={20} color={Colors.light.background} />
                  <Text style={styles.weatherDetailLabel}>Pressure</Text>
                  <Text style={styles.weatherDetailValue}>{currentWeather.pressure} hPa</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.saveWeatherButton}
                onPress={saveCurrentWeather}
              >
                <Ionicons name="save-outline" size={20} color={Colors.light.background} />
                <Text style={styles.saveWeatherText}>Save Weather Data</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animatable.View>
        )}

        {/* Weather Metrics */}
        {currentWeather && (
          <View style={styles.metricsContainer}>
            <Animatable.View animation="fadeInLeft" delay={200} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="sunny-outline" size={24} color={getUVIndexColor(currentWeather.uvIndex)} />
                <Text style={styles.metricTitle}>UV Index</Text>
              </View>
              <Text style={[styles.metricValue, { color: getUVIndexColor(currentWeather.uvIndex) }]}>
                {currentWeather.uvIndex}
              </Text>
              <Text style={styles.metricLabel}>{getUVIndexLabel(currentWeather.uvIndex)}</Text>
            </Animatable.View>

            <Animatable.View animation="fadeInRight" delay={300} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="eye-outline" size={24} color={Colors.light.info} />
                <Text style={styles.metricTitle}>Visibility</Text>
              </View>
              <Text style={[styles.metricValue, { color: Colors.light.info }]}>
                {currentWeather.visibility}
              </Text>
              <Text style={styles.metricLabel}>km</Text>
            </Animatable.View>
          </View>
        )}

        {/* Historical Weather Data */}
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Weather History</Text>
          
          {weatherData.length > 0 ? (
            weatherData.slice(0, 10).map((record, index) => (
              <Animatable.View
                key={record.id}
                animation="fadeInUp"
                delay={index * 100}
                style={styles.historyCard}
              >
                <View style={styles.historyHeader}>
                  <View style={styles.historyDate}>
                    <Ionicons name="calendar-outline" size={20} color={Colors.light.textSecondary} />
                    <Text style={styles.historyDateText}>
                      {new Date(record.recorded_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.historyWeather}>
                    <Ionicons
                      name={getWeatherIcon(record.weather_condition) as any}
                      size={24}
                      color={Colors.light.primary}
                    />
                    <Text style={[styles.historyTemp, { color: getTemperatureColor(record.temperature) }]}>
                      {record.temperature}°C
                    </Text>
                  </View>
                </View>

                <View style={styles.historyDetails}>
                  <View style={styles.historyDetailItem}>
                    <Text style={styles.historyDetailLabel}>Humidity:</Text>
                    <Text style={styles.historyDetailValue}>{record.humidity}%</Text>
                  </View>
                  
                  {record.rainfall > 0 && (
                    <View style={styles.historyDetailItem}>
                      <Text style={styles.historyDetailLabel}>Rainfall:</Text>
                      <Text style={styles.historyDetailValue}>{record.rainfall}mm</Text>
                    </View>
                  )}
                  
                  {record.wind_speed && (
                    <View style={styles.historyDetailItem}>
                      <Text style={styles.historyDetailLabel}>Wind:</Text>
                      <Text style={styles.historyDetailValue}>{record.wind_speed} km/h</Text>
                    </View>
                  )}
                </View>

                {record.notes && (
                  <View style={styles.historyNotes}>
                    <Text style={styles.historyNotesText}>{record.notes}</Text>
                  </View>
                )}
              </Animatable.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-outline" size={64} color={Colors.light.textSecondary} />
              <Text style={styles.emptyText}>No weather history</Text>
              <Text style={styles.emptySubtext}>Weather data will appear here as you record it</Text>
            </View>
          )}
        </View>

        {/* Location Permission Prompt */}
        {!locationPermission && (
          <View style={styles.permissionPrompt}>
            <Ionicons name="location-outline" size={48} color={Colors.light.textSecondary} />
            <Text style={styles.permissionTitle}>Location Access Needed</Text>
            <Text style={styles.permissionText}>
              Enable location access to get current weather data for your area
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestLocationPermission}
            >
              <Text style={styles.permissionButtonText}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <AlertComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.primary,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.background,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  currentWeatherContainer: {
    margin: Spacing.lg,
  },
  currentWeatherCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  currentWeatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  weatherIconContainer: {
    marginRight: Spacing.lg,
  },
  temperatureContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.background,
  },
  condition: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.background,
    opacity: 0.9,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  weatherDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  weatherDetailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.background,
    opacity: 0.8,
    marginTop: Spacing.xs,
  },
  weatherDetailValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.background,
    marginTop: Spacing.xs,
  },
  saveWeatherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  saveWeatherText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.background,
    marginLeft: Spacing.sm,
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.sm,
  },
  metricValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  metricLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  historyContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  historyCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.sm,
  },
  historyWeather: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTemp: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
  historyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  historyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDetailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginRight: Spacing.xs,
  },
  historyDetailValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
  },
  historyNotes: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  historyNotesText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  permissionPrompt: {
    alignItems: 'center',
    padding: Spacing.lg,
    margin: Spacing.lg,
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  permissionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  permissionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  permissionButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  permissionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.background,
  },
});