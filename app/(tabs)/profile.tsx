import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAuthStore } from '@/hooks/useAuth';
import { useAppStore } from '@/hooks/useApp';
import { useCustomAlert } from '@/components/ui/CustomAlert';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';

export default function ProfileScreen() {
  const { user, signOut, updateProfile, initialize } = useAuthStore();
  const { crops, activities, weatherData } = useAppStore();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
    location: user?.user_metadata?.location || '',
    farm_size: user?.user_metadata?.farm_size || '',
    farming_experience: user?.user_metadata?.farming_experience || '',
  });
  const [settings, setSettings] = useState({
    notifications: true,
    weatherAlerts: true,
    activityReminders: true,
    darkMode: false,
  });

  useEffect(() => {
    if (user?.user_metadata) {
      setFormData({
        full_name: user.user_metadata.full_name || '',
        phone: user.user_metadata.phone || '',
        location: user.user_metadata.location || '',
        farm_size: user.user_metadata.farm_size || '',
        farming_experience: user.user_metadata.farming_experience || '',
      });
    }
  }, [user]);

  const handleSignOut = () => {
    showAlert({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              showAlert({
                title: 'Success',
                message: 'You have been signed out successfully',
                type: 'success',
                buttons: [{ text: 'OK', onPress: () => {} }],
              });
            } catch (error) {
              showAlert({
                title: 'Error',
                message: error instanceof Error ? error.message : 'Failed to sign out. Please try again.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }],
              });
            }
          },
        },
      ],
    });
  };

  const handleUpdateProfile = async () => {
    console.log('🔄 Starting profile update...');
    console.log('📝 Original form data:', formData);
    
    try {
      // Map form data to ProfileUpdate interface
      const profileUpdates = {
        full_name: formData.full_name,
        phone: formData.phone,
        farm_location: formData.location, // Map location to farm_location
        farm_size: formData.farm_size,
        farming_experience: formData.farming_experience,
      };

      console.log('🔄 Mapped profile updates:', profileUpdates);
      console.log('👤 Current user ID:', user?.id);
      console.log('📊 Current user metadata:', user?.user_metadata);

      const result = await updateProfile(profileUpdates);
      
      console.log('📤 Update result:', result);
      
      if (result.error) {
        console.error('❌ Profile update failed:', result.error);
        showAlert({
          title: 'Update Failed',
          message: result.error.message || 'Failed to update profile',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => {} }],
        });
      } else {
        console.log('✅ Profile update successful!');
        setEditModalVisible(false);
        
        // Refresh user data to reflect changes
        console.log('🔄 Refreshing user data...');
        await initialize();
        console.log('✅ User data refreshed');
        
        showAlert({
          title: 'Success',
          message: 'Profile updated successfully!',
          type: 'success',
          buttons: [{ text: 'OK', onPress: () => {} }],
        });
      }
    } catch (error) {
      console.error('💥 Exception during profile update:', error);
      console.error('📋 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      showAlert({
        title: 'Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    }
  };

  const handleDeleteAccount = () => {
    showAlert({
      title: 'Delete Account',
      message: 'This action cannot be undone. All your data will be permanently deleted.',
      type: 'error',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            // TODO: Implement account deletion
            showAlert({
              title: 'Feature Coming Soon',
              message: 'Account deletion will be available in a future update.',
              type: 'info',
              buttons: [{ text: 'OK', onPress: () => {} }],
            });
          }
        },
      ],
    });
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatsData = () => {
    const totalCrops = crops.length;
    const activeCrops = crops.filter(crop => crop.status === 'growing' || crop.status === 'planted').length;
    const totalActivities = activities.length;
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return activityDate >= weekAgo;
    }).length;

    return {
      totalCrops,
      activeCrops,
      totalActivities,
      recentActivities,
      weatherRecords: weatherData.length,
    };
  };

  const stats = getStatsData();

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Edit Profile',
          onPress: () => setEditModalVisible(true),
          showArrow: true,
        },
        {
          icon: 'settings-outline',
          label: 'Settings',
          onPress: () => setSettingsModalVisible(true),
          showArrow: true,
        },
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          onPress: () => showAlert({
            title: 'Notifications',
            message: 'Notification settings will be available in a future update.',
            type: 'info',
            buttons: [{ text: 'OK', onPress: () => {} }],
          }),
          showArrow: true,
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          icon: 'download-outline',
          label: 'Export Data',
          onPress: () => showAlert({
            title: 'Export Data',
            message: 'Data export feature will be available in a future update.',
            type: 'info',
            buttons: [{ text: 'OK', onPress: () => {} }],
          }),
          showArrow: true,
        },
        {
          icon: 'shield-outline',
          label: 'Privacy Policy',
          onPress: () => showAlert({
            title: 'Privacy Policy',
            message: 'Your privacy is important to us. All data is stored securely and never shared without your consent.',
            type: 'info',
            buttons: [{ text: 'OK', onPress: () => {} }],
          }),
          showArrow: true,
        },
        {
          icon: 'document-text-outline',
          label: 'Terms of Service',
          onPress: () => showAlert({
            title: 'Terms of Service',
            message: 'By using this app, you agree to our terms of service.',
            type: 'info',
            buttons: [{ text: 'OK', onPress: () => {} }],
          }),
          showArrow: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help & FAQ',
          onPress: () => showAlert({
            title: 'Help & FAQ',
            message: 'For support, please contact us at support@farmapp.com',
            type: 'info',
            buttons: [{ text: 'OK', onPress: () => {} }],
          }),
          showArrow: true,
        },
        {
          icon: 'mail-outline',
          label: 'Contact Support',
          onPress: () => showAlert({
            title: 'Contact Support',
            message: 'Email: support@farmapp.com\nPhone: +1 (555) 123-4567',
            type: 'info',
            buttons: [{ text: 'OK', onPress: () => {} }],
          }),
          showArrow: true,
        },
        {
          icon: 'star-outline',
          label: 'Rate App',
          onPress: () => showAlert({
            title: 'Rate App',
            message: 'Thank you for using our app! Please rate us on the app store.',
            type: 'info',
            buttons: [{ text: 'OK', onPress: () => {} }],
          }),
          showArrow: true,
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          icon: 'trash-outline',
          label: 'Delete Account',
          onPress: handleDeleteAccount,
          showArrow: false,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Card */}
        <Animatable.View animation="fadeInDown" style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(user?.user_metadata?.full_name || user?.email)}
              </Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.user_metadata?.full_name || 'User'}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {user?.user_metadata?.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.locationText}>{user.user_metadata.location}</Text>
              </View>
            )}
            <Text style={styles.memberSince}>
              Member since {user?.created_at ? formatDate(user.created_at) : 'Unknown'}
            </Text>
          </View>
        </Animatable.View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Animatable.View animation="fadeInLeft" delay={200} style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="leaf-outline" size={24} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.totalCrops}</Text>
            <Text style={styles.statLabel}>Total Crops</Text>
            <Text style={styles.statSubtext}>{stats.activeCrops} active</Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={300} style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="clipboard-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalActivities}</Text>
            <Text style={styles.statLabel}>Activities</Text>
            <Text style={styles.statSubtext}>{stats.recentActivities} this week</Text>
          </Animatable.View>

          <Animatable.View animation="fadeInRight" delay={400} style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="cloud-outline" size={24} color={Colors.info} />
            </View>
            <Text style={styles.statValue}>{stats.weatherRecords}</Text>
            <Text style={styles.statLabel}>Weather</Text>
            <Text style={styles.statSubtext}>Records</Text>
          </Animatable.View>
        </View>

        {/* Profile Sections */}
        <View style={styles.sectionsContainer}>
          {profileSections.map((section, sectionIndex) => (
            <Animatable.View
              key={section.title}
              animation="fadeInUp"
              delay={500 + sectionIndex * 100}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionItems}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.sectionItem,
                      itemIndex === section.items.length - 1 && styles.sectionItemLast,
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={styles.sectionItemLeft}>
                      <View style={styles.sectionItemIcon}>
                        <Ionicons name={item.icon as any} size={20} color={Colors.textSecondary} />
                      </View>
                      <Text style={styles.sectionItemLabel}>{item.label}</Text>
                    </View>
                    {item.showArrow && (
                      <Ionicons name="chevron-forward-outline" size={20} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Animatable.View>
          ))}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleUpdateProfile}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.formInput}
                value={formData.full_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.formInput}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Location</Text>
              <TextInput
                style={styles.formInput}
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="Enter your location"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Farm Size (acres)</Text>
              <TextInput
                style={styles.formInput}
                value={formData.farm_size}
                onChangeText={(text) => setFormData(prev => ({ ...prev, farm_size: text }))}
                placeholder="Enter farm size"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Farming Experience (years)</Text>
              <TextInput
                style={styles.formInput}
                value={formData.farming_experience}
                onChangeText={(text) => setFormData(prev => ({ ...prev, farming_experience: text }))}
                placeholder="Years of farming experience"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
              <Text style={styles.modalCancelText}>Done</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Settings</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>Notifications</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <Text style={styles.settingItemLabel}>Push Notifications</Text>
                  <Text style={styles.settingItemDescription}>Receive app notifications</Text>
                </View>
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor={Colors.light.background}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <Text style={styles.settingItemLabel}>Weather Alerts</Text>
                  <Text style={styles.settingItemDescription}>Get notified about weather changes</Text>
                </View>
                <Switch
                  value={settings.weatherAlerts}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, weatherAlerts: value }))}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor={Colors.light.background}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <Text style={styles.settingItemLabel}>Activity Reminders</Text>
                  <Text style={styles.settingItemDescription}>Reminders for farm activities</Text>
                </View>
                <Switch
                  value={settings.activityReminders}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, activityReminders: value }))}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor={Colors.light.background}
                />
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>Appearance</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <Text style={styles.settingItemLabel}>Dark Mode</Text>
                  <Text style={styles.settingItemDescription}>Use dark theme</Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, darkMode: value }))}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor={Colors.light.background}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Custom Alert Component */}
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
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: Colors.light.card,
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.background,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.xs,
  },
  memberSince: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statIcon: {
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  statSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  sectionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionItems: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionItemLast: {
    borderBottomWidth: 0,
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionItemIcon: {
    marginRight: Spacing.md,
  },
  sectionItemLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalCancelText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  modalSaveText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.primary,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  formInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  settingGroup: {
    marginBottom: Spacing.lg,
  },
  settingGroupTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  settingItemLeft: {
    flex: 1,
  },
  settingItemLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  settingItemDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
});