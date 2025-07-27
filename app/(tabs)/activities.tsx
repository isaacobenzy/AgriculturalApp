import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '@/hooks/useAuth';
import { useAppStore } from '@/hooks/useApp';
import { useCustomAlert } from '@/components/ui/CustomAlert';
import { FarmActivity } from '@/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows, ActivityTypesList } from '@/constants';

Dimensions.get('window');

export default function ActivitiesScreen() {
  const { user } = useAuthStore();
  const { activities, crops, fetchActivities, fetchCrops, addActivity, updateActivity, deleteActivity } = useAppStore();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<FarmActivity | null>(null);
  const [formData, setFormData] = useState({
    crop_id: '',
    activity_type: 'watering',
    description: '',
    date: new Date(),
    duration_hours: '',
    cost: '',
    notes: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (user) {
      fetchActivities(user.id);
      fetchCrops(user.id);
    }
  }, [user, fetchActivities, fetchCrops]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await Promise.all([
      fetchActivities(user.id),
      fetchCrops(user.id)
    ]);
    setRefreshing(false);
  };

  const openModal = (activity: FarmActivity | null = null) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        crop_id: activity.crop_id || '',
        activity_type: activity.activity_type,
        description: activity.description,
        date: new Date(activity.date),
        duration_hours: activity.duration_hours?.toString() || '',
        cost: activity.cost?.toString() || '',
        notes: activity.notes || '',
      });
    } else {
      setEditingActivity(null);
      setFormData({
        crop_id: '',
        activity_type: 'watering',
        description: '',
        date: new Date(),
        duration_hours: '',
        cost: '',
        notes: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingActivity(null);
  };

  const handleSave = async () => {
    if (!user || !formData.description.trim()) {
      showAlert({
        title: 'Error',
        message: 'Please fill in the activity description',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
      return;
    }

    const activityData = {
      user_id: user.id,
      crop_id: formData.crop_id || undefined,
      activity_type: formData.activity_type as 'watering' | 'fertilizing' | 'planting' | 'harvesting' | 'pest_control' | 'other',
      description: formData.description.trim(),
      date: formData.date.toISOString().split('T')[0],
      duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      notes: formData.notes.trim() || undefined,
    };

    let result;
    if (editingActivity) {
      result = await updateActivity(editingActivity.id, activityData);
    } else {
      result = await addActivity(activityData);
    }

    if (result.error) {
      showAlert({
        title: 'Error',
        message: 'Failed to save activity',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    } else {
      closeModal();
      showAlert({
        title: 'Success',
        message: `Activity ${editingActivity ? 'updated' : 'added'} successfully`,
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
    }
  };

  const handleDelete = (activity: FarmActivity) => {
    showAlert({
      title: 'Delete Activity',
      message: 'Are you sure you want to delete this activity?',
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteActivity(activity.id);
            if (result.error) {
              showAlert({
                title: 'Error',
                message: 'Failed to delete activity',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }],
              });
            } else {
              showAlert({
                title: 'Success',
                message: 'Activity deleted successfully',
                type: 'success',
                buttons: [{ text: 'OK', onPress: () => {} }],
              });
            }
          },
        },
      ],
    });
  };

  const getActivityIcon = (type: string): any => {
    switch (type) {
      case 'watering': return 'water-outline';
      case 'fertilizing': return 'nutrition-outline';
      case 'planting': return 'leaf-outline';
      case 'harvesting': return 'basket-outline';
      case 'weeding': return 'cut-outline';
      case 'pest_control': return 'bug-outline';
      case 'soil_preparation': return 'earth-outline';
      case 'pruning': return 'cut-outline';
      case 'monitoring': return 'eye-outline';
      default: return 'ellipse-outline';
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'watering': return Colors.info;
      case 'fertilizing': return Colors.success;
      case 'planting': return Colors.primary;
      case 'harvesting': return Colors.warning;
      case 'weeding': return '#8B5CF6';
      case 'pest_control': return Colors.error;
      case 'soil_preparation': return '#A78BFA';
      case 'pruning': return '#F59E0B';
      case 'monitoring': return '#10B981';
      default: return Colors.textSecondary;
    }
  };

  const getCropName = (cropId: string | null | undefined): string => {
    if (!cropId) return 'General Activity';
    const crop = crops.find(c => c.id === cropId);
    return crop ? crop.name : 'General Activity';
  };

  const filteredActivities = activities.filter(activity => {
    if (filterType === 'all') return true;
    return activity.activity_type === filterType;
  });

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Farm Activities</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openModal()}
        >
          <Ionicons name="add" size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filterType === 'all' && styles.filterTabActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterTabText, filterType === 'all' && styles.filterTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {ActivityTypesList.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterTab, filterType === type && styles.filterTabActive]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[styles.filterTabText, filterType === type && styles.filterTabTextActive]}>
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Activities List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => (
              <Animatable.View
                key={activity.id}
                animation="fadeInUp"
                delay={index * 100}
                style={styles.activityCard}
              >
                <View style={styles.activityHeader}>
                  <View style={styles.activityIcon}>
                    <View style={[styles.iconContainer, { backgroundColor: getActivityColor(activity.activity_type) }]}>
                      <Ionicons
                        name={getActivityIcon(activity.activity_type) as any}
                        size={24}
                        color={Colors.light.background}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <Text style={styles.activityType}>
                      {activity.activity_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                    </Text>
                    <Text style={styles.cropName}>{getCropName(activity.crop_id)}</Text>
                  </View>

                  <View style={styles.activityMeta}>
                    <Text style={styles.activityDate}>
                      {new Date(activity.date).toLocaleDateString()}
                    </Text>
                    {activity.duration_hours && (
                      <Text style={styles.activityDuration}>
                        {activity.duration_hours}h
                      </Text>
                    )}
                    {activity.cost && (
                      <Text style={styles.activityCost}>
                        ₵{activity.cost}
                      </Text>
                    )}
                  </View>
                </View>

                {activity.notes && (
                  <View style={styles.activityNotes}>
                    <Text style={styles.notesText}>{activity.notes}</Text>
                  </View>
                )}

                <View style={styles.activityFooter}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openModal(activity)}
                  >
                    <Ionicons name="create-outline" size={20} color={Colors.light.primary} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(activity)}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color={Colors.light.textSecondary} />
              <Text style={styles.emptyText}>No activities yet</Text>
              <Text style={styles.emptySubtext}>Start tracking your farm activities!</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => openModal()}
              >
                <Text style={styles.emptyButtonText}>Add Activity</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingActivity ? 'Edit Activity' : 'Add Activity'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Activity Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.activity_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, activity_type: value }))}
                  style={styles.picker}
                >
                  {ActivityTypesList.map((type) => (
                    <Picker.Item
                      key={type}
                      label={type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      value={type}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Related Crop (Optional)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.crop_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, crop_id: value }))}
                  style={styles.picker}
                >
                  <Picker.Item label="General Activity" value="" />
                  {crops.map((crop) => (
                    <Picker.Item
                      key={crop.id}
                      label={crop.name}
                      value={crop.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Describe the activity"
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formData.date.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Duration (hours)</Text>
              <TextInput
                style={styles.formInput}
                value={formData.duration_hours}
                onChangeText={(text) => setFormData(prev => ({ ...prev, duration_hours: text }))}
                placeholder="Enter duration in hours"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cost (₵)</Text>
              <TextInput
                style={styles.formInput}
                value={formData.cost}
                onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                placeholder="Enter cost"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Additional notes (optional)"
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </SafeAreaView>

        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </Modal>
      
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
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  filterContainer: {
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.background,
  },
  filterTabActive: {
    backgroundColor: Colors.light.primary,
  },
  filterTabText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  filterTabTextActive: {
    color: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  activityCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  activityIcon: {
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  activityType: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  cropName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  activityDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  activityDuration: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.info,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  activityCost: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.success,
    fontWeight: Typography.fontWeight.medium,
  },
  activityNotes: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  notesText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surface,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.xs,
  },
  deleteButtonText: {
    color: Colors.light.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  emptyButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.background,
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
  textArea: {
    height: 100,
  },
  pickerContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  picker: {
    height: 50,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
});