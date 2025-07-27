export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          farm_name: string | null;
          farm_location: string | null;
          farm_size: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          farm_name?: string | null;
          farm_location?: string | null;
          farm_size?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          farm_name?: string | null;
          farm_location?: string | null;
          farm_size?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      crops: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          variety: string | null;
          planting_date: string;
          expected_harvest_date: string | null;
          actual_harvest_date: string | null;
          field_location: string | null;
          area_planted: number | null;
          status: 'planted' | 'growing' | 'harvested' | 'failed';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          variety?: string | null;
          planting_date: string;
          expected_harvest_date?: string | null;
          actual_harvest_date?: string | null;
          field_location?: string | null;
          area_planted?: number | null;
          status?: 'planted' | 'growing' | 'harvested' | 'failed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          variety?: string | null;
          planting_date?: string;
          expected_harvest_date?: string | null;
          actual_harvest_date?: string | null;
          field_location?: string | null;
          area_planted?: number | null;
          status?: 'planted' | 'growing' | 'harvested' | 'failed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      weather_data: {
        Row: {
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
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          location: string;
          temperature: number;
          humidity: number;
          rainfall: number;
          wind_speed: number;
          weather_condition: string;
          recorded_at: string;
          created_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          location?: string;
          temperature?: number;
          humidity?: number;
          rainfall?: number;
          wind_speed?: number;
          weather_condition?: string;
          recorded_at?: string;
          created_at?: string;
          notes?: string | null;
        };
      };
      farm_activities: {
        Row: {
          id: string;
          user_id: string;
          crop_id: string | null;
          activity_type: 'planting' | 'watering' | 'fertilizing' | 'harvesting' | 'pest_control' | 'other';
          description: string;
          date: string;
          duration_hours: number | null;
          cost: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          crop_id?: string | null;
          activity_type: 'planting' | 'watering' | 'fertilizing' | 'harvesting' | 'pest_control' | 'other';
          description: string;
          date: string;
          duration_hours?: number | null;
          cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          crop_id?: string | null;
          activity_type?: 'planting' | 'watering' | 'fertilizing' | 'harvesting' | 'pest_control' | 'other';
          description?: string;
          date?: string;
          duration_hours?: number | null;
          cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      crop_photos: {
        Row: {
          id: string;
          crop_id: string;
          user_id: string;
          photo_url: string;
          description: string | null;
          taken_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          crop_id: string;
          user_id: string;
          photo_url: string;
          description?: string | null;
          taken_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          crop_id?: string;
          user_id?: string;
          photo_url?: string;
          description?: string | null;
          taken_at?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}