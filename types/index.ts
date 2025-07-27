import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  farm_name?: string;
  farm_location?: string;
  farm_size?: number;
}

export interface Crop {
  id: string;
  user_id: string;
  name: string;
  variety?: string;
  planting_date: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
  field_location?: string;
  area_planted?: number;
  status: 'planted' | 'growing' | 'harvested' | 'failed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WeatherData {
  id: string;
  user_id: string;
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  weather_condition: string;
  recorded_at: string;
  created_at: string;
  notes?: string;
}

export interface FarmActivity {
  id: string;
  user_id: string;
  crop_id?: string;
  activity_type: 'planting' | 'watering' | 'fertilizing' | 'harvesting' | 'pest_control' | 'other';
  description: string;
  date: string;
  duration_hours?: number;
  cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CropPhoto {
  id: string;
  crop_id: string;
  user_id: string;
  photo_url: string;
  description?: string;
  taken_at: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface AppState {
  crops: Crop[];
  activities: FarmActivity[];
  weatherData: WeatherData[];
  loading: boolean;
  error: string | null;
}