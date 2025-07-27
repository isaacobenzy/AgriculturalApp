# 🌱 AgriTrack - Smart Farming Companion

A comprehensive React Native mobile application built with Expo for modern agricultural management. Track crops, monitor weather, manage activities, and analyze farm data with an intuitive interface.

## 📱 Features

### 🔐 Authentication System
- **User Registration & Login**: Secure authentication with Supabase
- **OTP Verification**: Email-based verification system
- **Profile Management**: Update personal and farm information
- **Session Management**: Persistent login with automatic token refresh

### 🌾 Crop Management
- **Crop Tracking**: Add, edit, and monitor crop lifecycle
- **Status Management**: Track planting, growing, harvesting stages
- **Photo Documentation**: Capture and store crop photos
- **Crop Analytics**: Visual charts and statistics

### 📊 Activity Management
- **Activity Logging**: Record farming activities (planting, watering, fertilizing, etc.)
- **Activity History**: View comprehensive activity timeline
- **Activity Analytics**: Track productivity and patterns
- **Quick Actions**: Fast activity entry with predefined types

### 🌤️ Weather Integration
- **Real-time Weather**: Current weather conditions
- **Location-based**: GPS-enabled weather data
- **Weather History**: Historical weather tracking
- **Weather Alerts**: Notifications for weather changes

### 📈 Analytics & Insights
- **Dashboard Overview**: Key metrics and statistics
- **Visual Charts**: Interactive data visualization
- **Progress Tracking**: Monitor farm productivity
- **Data Export**: Export farm data for analysis

## 🏗️ Project Structure

```
AgriculturalApp/
├── app/                          # Main application screens
│   ├── (auth)/                   # Authentication flow
│   │   ├── _layout.tsx          # Auth layout wrapper
│   │   ├── welcome.tsx          # Welcome/landing screen
│   │   ├── login.tsx            # Login screen
│   │   └── register.tsx         # Registration screen
│   ├── (tabs)/                   # Main app tabs
│   │   ├── _layout.tsx          # Tab layout with bottom navigation
│   │   ├── index.tsx            # Dashboard/Home screen
│   │   ├── crops.tsx            # Crop management screen
│   │   ├── activities.tsx       # Activity management screen
│   │   ├── weather.tsx          # Weather monitoring screen
│   │   └── profile.tsx          # User profile screen
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # App entry point with auth routing
│   ├── all-crops.tsx            # Detailed crops view
│   └── all-activities.tsx       # Detailed activities view
├── components/                   # Reusable components
│   ├── ui/                      # UI components
│   │   ├── Button.tsx           # Custom button component
│   │   ├── Card.tsx             # Card container component
│   │   ├── CustomAlert.tsx      # Alert/modal component
│   │   ├── EmptyState.tsx       # Empty state component
│   │   ├── Input.tsx            # Input field component
│   │   └── Loading.tsx          # Loading indicator
│   ├── Charts.tsx               # Data visualization charts
│   ├── CropPhotoManager.tsx     # Photo management component
│   ├── ErrorBoundary.tsx        # Error handling wrapper
│   └── FinanceManager.tsx       # Financial tracking component
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts               # Authentication state management
│   └── useApp.ts                # Application state management
├── lib/                         # External libraries configuration
│   └── supabase.ts              # Supabase client setup
├── services/                     # External services
│   ├── imageService.ts          # Image handling service
│   └── notificationService.ts   # Push notifications
├── types/                        # TypeScript type definitions
│   ├── database.ts              # Database schema types
│   └── index.ts                 # Exported types
├── utils/                        # Utility functions
│   ├── dateUtils.ts             # Date formatting utilities
│   ├── validation.ts            # Form validation helpers
│   └── weatherApi.ts            # Weather API integration
├── constants/                    # App constants
│   └── index.ts                 # Colors, typography, spacing
└── supabase/                     # Database schema
    └── schema.sql               # Database structure
```

## 🔄 Application Flow

### Authentication Flow
```
App Start → Check Auth State → 
├── Authenticated → Main App (Tabs)
└── Not Authenticated → Welcome → Login/Register → Main App
```

### Main App Navigation
```
Bottom Tab Navigation:
├── 🏠 Dashboard (index.tsx)
├── 🌾 Crops (crops.tsx)
├── 📋 Activities (activities.tsx)
├── 🌤️ Weather (weather.tsx)
└── 👤 Profile (profile.tsx)
```

### Data Flow
```
User Action → Component → Hook (useAuth/useApp) → Supabase → UI Update
```

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: React Native StyleSheet
- **Icons**: Expo Vector Icons (Ionicons)
- **Charts**: React Native Chart Kit
- **Animations**: React Native Animatable
- **Location**: Expo Location
- **Image Handling**: Expo Image Picker

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)
- Supabase account

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AgriculturalApp
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql`
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers

### 5. Start Development Server
```bash
npx expo start
```

### 6. Run on Device/Simulator
- **iOS**: Press `i` in terminal or scan QR code with Camera app
- **Android**: Press `a` in terminal or scan QR code with Expo Go app

## 🗄️ Database Schema

### Core Tables
- **profiles**: User profile information
- **crops**: Crop records and status
- **activities**: Farm activity logs
- **weather_data**: Weather history records

### Key Relationships
```sql
profiles (1) → (many) crops
profiles (1) → (many) activities
profiles (1) → (many) weather_data
crops (1) → (many) activities
```

## 🔧 Configuration

### App Configuration (`app.json`)
```json
{
  "expo": {
    "name": "AgriTrack",
    "slug": "agritrack",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "orientation": "portrait"
  }
}
```

### TypeScript Configuration
- Strict type checking enabled
- Path aliases configured (`@/` for root imports)
- React Native types included

## 📱 Key Features Implementation

### State Management
- **Zustand stores** for global state
- **useAuth**: Authentication state and methods
- **useApp**: Application data (crops, activities, weather)

### Navigation
- **File-based routing** with Expo Router
- **Protected routes** with authentication checks
- **Tab navigation** for main app sections

### Data Persistence
- **Supabase integration** for real-time data
- **Offline support** with local state management
- **Image storage** with Supabase Storage

### UI/UX Features
- **Responsive design** for various screen sizes
- **Loading states** and error handling
- **Custom alerts** and notifications
- **Smooth animations** with React Native Animatable

## 🧪 Development Guidelines

### Code Structure
- **Component-based architecture**
- **Custom hooks** for business logic
- **TypeScript** for type safety
- **Consistent styling** with design system

### Best Practices
- **Error boundaries** for crash prevention
- **Input validation** for data integrity
- **Responsive design** principles
- **Performance optimization**

## 🚀 Deployment

### Building for Production
```bash
# iOS
npx expo build:ios

# Android
npx expo build:android
```

### Environment Variables
Ensure all production environment variables are configured in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Offline mode support
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Export functionality
- [ ] Social features
- [ ] IoT device integration

---

**Built with ❤️ for modern farmers**
