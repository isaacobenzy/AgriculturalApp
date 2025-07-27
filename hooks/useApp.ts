import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Crop, FarmActivity, WeatherData } from '@/types';

interface AppError {
  message: string;
  status?: number;
}

interface AppState {
  crops: Crop[];
  activities: FarmActivity[];
  weatherData: WeatherData[];
  loading: boolean;
  error: string | null;
  
  // Crop actions
  fetchCrops: (userId: string) => Promise<void>;
  addCrop: (crop: Omit<Crop, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error?: AppError }>;
  updateCrop: (id: string, updates: Partial<Crop>) => Promise<{ error?: AppError }>;
  deleteCrop: (id: string) => Promise<{ error?: AppError }>;
  
  // Activity actions
  fetchActivities: (userId: string) => Promise<void>;
  addActivity: (activity: Omit<FarmActivity, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error?: AppError }>;
  updateActivity: (id: string, updates: Partial<FarmActivity>) => Promise<{ error?: AppError }>;
  deleteActivity: (id: string) => Promise<{ error?: AppError }>;
  
  // Weather actions
  fetchWeatherData: (userId: string) => Promise<void>;
  addWeatherData: (weather: Omit<WeatherData, 'id' | 'created_at'>) => Promise<{ error?: AppError }>;
  
  // Utility actions
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  crops: [],
  activities: [],
  weatherData: [],
  loading: false,
  error: null,

  // Crop actions
  fetchCrops: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ crops: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addCrop: async (crop) => {
    try {
      const { data, error } = await supabase
        .from('crops')
        .insert(crop)
        .select()
        .single();

      if (error) return { error: { message: error.message } };

      const { crops } = get();
      set({ crops: [data, ...crops] });
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  },

  updateCrop: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('crops')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return { error: { message: error.message } };

      const { crops } = get();
      set({
        crops: crops.map(crop => crop.id === id ? data : crop)
      });
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  },

  deleteCrop: async (id) => {
    try {
      const { error } = await supabase
        .from('crops')
        .delete()
        .eq('id', id);

      if (error) return { error: { message: error.message } };

      const { crops } = get();
      set({ crops: crops.filter(crop => crop.id !== id) });
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  },

  // Activity actions
  fetchActivities: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      set({ activities: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addActivity: async (activity) => {
    try {
      const { data, error } = await supabase
        .from('farm_activities')
        .insert(activity)
        .select()
        .single();

      if (error) return { error: { message: error.message } };

      const { activities } = get();
      set({ activities: [data, ...activities] });
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  },

  updateActivity: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('farm_activities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return { error: { message: error.message } };

      const { activities } = get();
      set({
        activities: activities.map(activity => activity.id === id ? data : activity)
      });
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  },

  deleteActivity: async (id) => {
    try {
      const { error } = await supabase
        .from('farm_activities')
        .delete()
        .eq('id', id);

      if (error) return { error: { message: error.message } };

      const { activities } = get();
      set({ activities: activities.filter(activity => activity.id !== id) });
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  },

  // Weather actions
  fetchWeatherData: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('weather_data')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(30); // Last 30 records

      if (error) throw error;
      set({ weatherData: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addWeatherData: async (weather) => {
    try {
      const { data, error } = await supabase
        .from('weather_data')
        .insert(weather)
        .select()
        .single();

      if (error) return { error: { message: error.message } };

      const { weatherData } = get();
      set({ weatherData: [data, ...weatherData.slice(0, 29)] }); // Keep only 30 records
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  },

  clearError: () => set({ error: null }),
}));