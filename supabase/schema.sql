-- Create tables first
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  farm_name TEXT,
  farm_location TEXT,
  farm_size NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  variety TEXT,
  planting_date DATE NOT NULL,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  field_location TEXT,
  area_planted NUMERIC,
  status TEXT CHECK (status IN ('planted', 'growing', 'harvested', 'failed')) DEFAULT 'planted',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  crop_id UUID REFERENCES crops(id),
  activity_type TEXT CHECK (activity_type IN ('planting', 'watering', 'fertilizing', 'harvesting', 'pest_control', 'other')) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  duration_hours NUMERIC,
  cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weather_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  location TEXT NOT NULL,
  temperature NUMERIC NOT NULL,
  humidity NUMERIC NOT NULL,
  rainfall NUMERIC NOT NULL,
  wind_speed NUMERIC NOT NULL,
  weather_condition TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON crops(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_user_id ON farm_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_crop_id ON farm_activities(crop_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_user_id ON weather_data(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_recorded_at ON weather_data(recorded_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farm_activities_updated_at BEFORE UPDATE ON farm_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

-- Profiles table policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Crops table policies
CREATE POLICY "Users can view own crops" ON crops
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crops" ON crops
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crops" ON crops
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own crops" ON crops
  FOR DELETE USING (auth.uid() = user_id);

-- Farm activities table policies
CREATE POLICY "Users can view own activities" ON farm_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON farm_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON farm_activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON farm_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Weather data table policies
CREATE POLICY "Users can view own weather data" ON weather_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weather data" ON weather_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weather data" ON weather_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weather data" ON weather_data
  FOR DELETE USING (auth.uid() = user_id);