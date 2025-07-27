import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../hooks/useAuth';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants';

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: 'planting' | 'watering' | 'fertilizing' | 'harvesting' | 'pest_control' | 'other';
  date: string;
  crop_id?: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  created_at: string;
}

export default function AllActivitiesScreen() {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'planting': return 'leaf-outline';
      case 'watering': return 'water-outline';
      case 'fertilizing': return 'nutrition-outline';
      case 'harvesting': return 'basket-outline';
      case 'pest_control': return 'bug-outline';
      default: return 'clipboard-outline';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'planting': return '#10B981';
      case 'watering': return '#3B82F6';
      case 'fertilizing': return '#F59E0B';
      case 'harvesting': return '#EF4444';
      case 'pest_control': return '#8B5CF6';
      default: return Colors.light.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'in_progress': return '#3B82F6';
      case 'completed': return '#10B981';
      default: return Colors.light.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity 
      style={styles.activityCard}
      onPress={() => router.push('/(tabs)/activities')}
    >
      <View style={styles.activityHeader}>
        <View style={[styles.activityIcon, { backgroundColor: getActivityColor(item.activity_type) }]}>
          <Ionicons 
            name={getActivityIcon(item.activity_type) as any} 
            size={20} 
            color={Colors.light.background} 
          />
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.activityFooter}>
        <View style={styles.activityMeta}>
          <Ionicons name="calendar-outline" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.activityDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.activityMeta}>
          <Ionicons name="pricetag-outline" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.activityType}>{item.activity_type.replace('_', ' ')}</Text>
        </View>
      </View>

      {item.notes && (
        <Text style={styles.activityNotes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.light.background} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Activities</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/activities')}
        >
          <Ionicons name="add" size={24} color={Colors.light.background} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color={Colors.light.textSecondary} />
            <Text style={styles.emptyTitle}>No Activities Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start tracking your farm activities to see them here
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/activities')}
            >
              <Text style={styles.emptyButtonText}>Add Your First Activity</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.background,
  },
  addButton: {
    padding: Spacing.sm,
  },
  listContainer: {
    padding: Spacing.lg,
  },
  activityCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  activityTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  activityDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.background,
    textTransform: 'capitalize',
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  activityDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  activityType: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textTransform: 'capitalize',
  },
  activityNotes: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    fontStyle: 'italic',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  emptyButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.background,
  },
});