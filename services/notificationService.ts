import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleWateringReminder = async (cropName: string, time: Date): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Watering Reminder 💧',
        body: `Time to water your ${cropName}!`,
        data: { type: 'watering', cropName },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.getHours(),
        minute: time.getMinutes(),
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling watering reminder:', error);
    return null;
  }
};

export const scheduleHarvestReminder = async (cropName: string, harvestDate: Date): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Schedule reminder 3 days before harvest
    const reminderDate = new Date(harvestDate);
    reminderDate.setDate(reminderDate.getDate() - 3);

    if (reminderDate <= new Date()) {
      // If reminder date is in the past, schedule for harvest day
      reminderDate.setTime(harvestDate.getTime());
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Harvest Reminder 🌾',
        body: `Your ${cropName} is ready for harvest soon!`,
        data: { type: 'harvest', cropName },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling harvest reminder:', error);
    return null;
  }
};

export const scheduleWeatherAlert = async (condition: string, location: string): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    let title = 'Weather Alert 🌤️';
    let body = `Weather update for ${location}: ${condition}`;

    // Customize based on weather condition
    if (condition.toLowerCase().includes('rain')) {
      title = 'Rain Alert 🌧️';
      body = `Rain expected in ${location}. Consider protecting your crops!`;
    } else if (condition.toLowerCase().includes('storm')) {
      title = 'Storm Warning ⛈️';
      body = `Storm warning for ${location}. Secure your farm equipment!`;
    } else if (condition.toLowerCase().includes('frost')) {
      title = 'Frost Warning ❄️';
      body = `Frost warning for ${location}. Protect sensitive crops!`;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'weather', condition, location },
      },
      trigger: null, // Send immediately
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling weather alert:', error);
    return null;
  }
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

export const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};