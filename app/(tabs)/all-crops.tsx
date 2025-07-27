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

interface Crop {
  id: string;
  name: string;
  variety: string;
  planting_date: string;
  expected_harvest: string;
  status: 'planted' | 'growing' | 'flowering' | 'ready' | 'harvested';
  area_size: number;
  notes?: string;
  created_at: string;
}

export default function AllCropsScreen() {
  const { user } = useAuthStore();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCrops = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCrops(data || []);
    } catch (error) {
      console.error('Error fetching crops:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [user, fetchCrops]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCrops();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted': return '#8B5CF6';
      case 'growing': return '#10B981';
      case 'flowering': return '#F59E0B';
      case 'ready': return '#EF4444';
      case 'harvested': return '#6B7280';
      default: return Colors.light.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planted': return 'leaf-outline';
      case 'growing': return 'trending-up-outline';
      case 'flowering': return 'flower-outline';
      case 'ready': return 'checkmark-circle-outline';
      case 'harvested': return 'archive-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderCropItem = ({ item }: { item: Crop }) => (
    <TouchableOpacity 
      style={styles.cropCard}
      onPress={() => router.push('/(tabs)/crops')}
    >
      <View style={styles.cropHeader}>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{item.name}</Text>
          <Text style={styles.cropVariety}>{item.variety}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status) as any} 
            size={16} 
            color={Colors.light.background} 
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cropDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.detailText}>Planted: {formatDate(item.planting_date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.detailText}>Harvest: {formatDate(item.expected_harvest)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="resize-outline" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.detailText}>Area: {item.area_size} sq ft</Text>
        </View>
      </View>

      {item.notes && (
        <Text style={styles.cropNotes} numberOfLines={2}>
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
        <Text style={styles.headerTitle}>All Crops</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/crops')}
        >
          <Ionicons name="add" size={24} color={Colors.light.background} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={crops}
        renderItem={renderCropItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color={Colors.light.textSecondary} />
            <Text style={styles.emptyTitle}>No Crops Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start tracking your crops to see them here
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/crops')}
            >
              <Text style={styles.emptyButtonText}>Add Your First Crop</Text>
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
  cropCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  cropVariety: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.background,
    textTransform: 'capitalize',
  },
  cropDetails: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  cropNotes: {
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