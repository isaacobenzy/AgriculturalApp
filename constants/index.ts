export const Colors = {
  light: {
    primary: '#22c55e',
    primaryDark: '#16a34a',
    secondary: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6',
    accent: '#8b5cf6',
  },
  dark: {
    primary: '#22c55e',
    primaryDark: '#16a34a',
    secondary: '#3b82f6',
    background: '#111827',
    surface: '#1f2937',
    card: '#374151',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#4b5563',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6',
    accent: '#8b5cf6',
  },
  // Simplified exports for easier use
  primary: '#22c55e',
  primaryDark: '#16a34a',
  secondary: '#3b82f6',
  background: '#ffffff',
  surface: '#f8fafc',
  card: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  gray: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6',
  accent: '#8b5cf6',
  white: '#ffffff',
  black: '#000000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  // Simplified exports
  small: 8,
  medium: 16,
  large: 24,
  extraLarge: 32,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    xxl: 42,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Simplified text styles
  heading1: {
    fontSize: 30,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const Layout = {
  window: {
    width: 375, // Default iPhone width
    height: 812, // Default iPhone height
  },
  isSmallDevice: false, // Will be set dynamically
};

export const AnimationDuration = {
  fast: 200,
  normal: 300,
  slow: 500,
};

export const CropTypes = [
  'Corn',
  'Wheat',
  'Rice',
  'Soybeans',
  'Tomatoes',
  'Potatoes',
  'Carrots',
  'Lettuce',
  'Onions',
  'Peppers',
  'Beans',
  'Peas',
  'Cucumbers',
  'Squash',
  'Pumpkins',
  'Other',
];

export const ActivityTypes = [
  { value: 'planting', label: 'Planting', icon: '🌱' },
  { value: 'watering', label: 'Watering', icon: '💧' },
  { value: 'fertilizing', label: 'Fertilizing', icon: '🌿' },
  { value: 'harvesting', label: 'Harvesting', icon: '🌾' },
  { value: 'pest_control', label: 'Pest Control', icon: '🐛' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export const ActivityTypesList = [
  'planting',
  'watering', 
  'fertilizing',
  'harvesting',
  'pest_control',
  'other',
];

export const WeatherConditions = [
  'Sunny',
  'Partly Cloudy',
  'Cloudy',
  'Rainy',
  'Stormy',
  'Snowy',
  'Foggy',
  'Windy',
];