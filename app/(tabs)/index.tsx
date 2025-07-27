import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/hooks/useAuth';
import { useAppStore } from '@/hooks/useApp';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { crops, activities, fetchCrops, fetchActivities } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadData = useCallback(async () => {
    if (user) {
      await Promise.all([
        fetchCrops(user.id),
        fetchActivities(user.id)
      ]);
    }
  }, [user, fetchCrops, fetchActivities]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await Promise.all([
      fetchCrops(user.id),
      fetchActivities(user.id)
    ]);
    setRefreshing(false);
  };

  const activeCrops = crops.filter(crop => crop.status === 'growing' || crop.status === 'planted');
  const recentActivities = activities.slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark]}
          style={styles.header}
        >
          <Animatable.View animation="fadeInDown" duration={800}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>
              {user?.user_metadata?.full_name || 'Farmer'}! 👋
            </Text>
          </Animatable.View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats Cards */}
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <Text style={styles.sectionTitle}>Farm Overview</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="leaf" size={24} color={Colors.light.primary} />
                </View>
                <Text style={styles.statNumber}>{crops.length}</Text>
                <Text style={styles.statLabel}>Total Crops</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="trending-up" size={24} color={Colors.light.success} />
                </View>
                <Text style={styles.statNumber}>{activeCrops.length}</Text>
                <Text style={styles.statLabel}>Active Crops</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="calendar" size={24} color={Colors.light.secondary} />
                </View>
                <Text style={styles.statNumber}>{activities.length}</Text>
                <Text style={styles.statLabel}>Activities</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Active Crops */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Crops</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/all-crops')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {activeCrops.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsScroll}>
                {activeCrops.slice(0, 5).map((crop, index) => (
                  <Animatable.View
                    key={crop.id}
                    animation="fadeInRight"
                    delay={index * 100}
                    style={styles.cropCard}
                  >
                    <View style={styles.cropHeader}>
                      <Text style={styles.cropName}>{crop.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(crop.status) }]}>
                        <Text style={styles.statusText}>{crop.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.cropVariety}>{crop.variety || 'Standard'}</Text>
                    <Text style={styles.cropDate}>
                      Planted: {new Date(crop.planting_date).toLocaleDateString()}
                    </Text>
                  </Animatable.View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={48} color={Colors.light.textSecondary} />
                <Text style={styles.emptyText}>No active crops yet</Text>
                <Text style={styles.emptySubtext}>Start by adding your first crop!</Text>
              </View>
            )}
          </Animatable.View>

          {/* Recent Activities */}
          <Animatable.View animation="fadeInUp" duration={800} delay={600}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/all-activities')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {recentActivities.length > 0 ? (
              <View style={styles.activitiesList}>
                {recentActivities.map((activity, index) => (
                  <Animatable.View
                    key={activity.id}
                    animation="fadeInLeft"
                    delay={index * 100}
                    style={styles.activityItem}
                  >
                    <View style={styles.activityIcon}>
                      <Text style={styles.activityEmoji}>
                        {getActivityIcon(activity.activity_type)}
                      </Text>
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.description}</Text>
                      <Text style={styles.activityDate}>
                        {new Date(activity.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.activityType}>
                      {activity.activity_type.replace('_', ' ')}
                    </Text>
                  </Animatable.View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={Colors.light.textSecondary} />
                <Text style={styles.emptyText}>No activities yet</Text>
                <Text style={styles.emptySubtext}>Record your first farm activity!</Text>
              </View>
            )}
          </Animatable.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planted': return Colors.light.info;
    case 'growing': return Colors.light.success;
    case 'harvested': return Colors.light.warning;
    case 'failed': return Colors.light.error;
    default: return Colors.light.textSecondary;
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'planting': return '🌱';
    case 'watering': return '💧';
    case 'fertilizing': return '🌿';
    case 'harvesting': return '🌾';
    case 'pest_control': return '🐛';
    default: return '📝';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  greeting: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.background,
    opacity: 0.9,
  },
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.background,
    marginTop: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.xs,
    ...Shadows.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  cropsScroll: {
    marginBottom: Spacing.xl,
   
  },
  cropCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    marginRight: Spacing.md,
    width: width * 0.7,
    ...Shadows.md,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cropName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.background,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  cropVariety: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  cropDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  activitiesList: {
    gap: Spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
  },
  activityDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  activityType: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
});