import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/hooks/useAuth';
import { useAppStore } from '@/hooks/useApp';
import { Crop } from '@/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';

const { width } = Dimensions.get('window');

export default function CropsScreen() {
  const { user } = useAuthStore();
  const { crops, fetchCrops, addCrop, updateCrop, deleteCrop, loading } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    planting_date: new Date(),
    expected_harvest_date: new Date(),
    field_location: '',
    area_planted: '',
    status: 'planted',
    notes: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('planting');

  useEffect(() => {
    if (user) {
      fetchCrops(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchCrops(user.id);
    setRefreshing(false);
  };

  const openModal = (crop: Crop | null = null) => {
    if (crop) {
      setEditingCrop(crop);
      setFormData({
        name: crop.name,
        variety: crop.variety || '',
        planting_date: new Date(crop.planting_date),
        expected_harvest_date: crop.expected_harvest_date ? new Date(crop.expected_harvest_date) : new Date(),
        field_location: crop.field_location || '',
        area_planted: crop.area_planted?.toString() || '',
        status: crop.status,
        notes: crop.notes || '',
      });
    } else {
      setEditingCrop(null);
      setFormData({
        name: '',
        variety: '',
        planting_date: new Date(),
        expected_harvest_date: new Date(),
        field_location: '',
        area_planted: '',
        status: 'planted',
        notes: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCrop(null);
  };

  const handleSave = async () => {
    if (!user || !formData.name.trim()) {
      Alert.alert('Error', 'Please fill in the crop name');
      return;
    }

    const cropData = {
      user_id: user.id,
      name: formData.name.trim(),
      variety: formData.variety.trim() || undefined,
      planting_date: formData.planting_date.toISOString().split('T')[0],
      expected_harvest_date: formData.expected_harvest_date.toISOString().split('T')[0],
      field_location: formData.field_location.trim() || undefined,
      area_planted: formData.area_planted ? parseFloat(formData.area_planted) : undefined,
      status: formData.status as 'planted' | 'growing' | 'harvested' | 'failed',
      notes: formData.notes.trim() || undefined,
    };

    let result;
    if (editingCrop) {
      result = await updateCrop(editingCrop.id, cropData);
    } else {
      result = await addCrop(cropData);
    }

    if (result.error) {
      Alert.alert('Error', 'Failed to save crop');
    } else {
      closeModal();
      Alert.alert('Success', `Crop ${editingCrop ? 'updated' : 'added'} successfully`);
    }
  };

  const handleDelete = (crop: Crop) => {
    Alert.alert(
      'Delete Crop',
      `Are you sure you want to delete ${crop.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCrop(crop.id);
            if (result.error) {
              Alert.alert('Error', 'Failed to delete crop');
            } else {
              Alert.alert('Success', 'Crop deleted successfully');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted': return Colors.info;
      case 'growing': return Colors.success;
      case 'harvested': return Colors.warning;
      case 'failed': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planted': return 'seed-outline';
      case 'growing': return 'leaf-outline';
      case 'harvested': return 'checkmark-circle-outline';
      case 'failed': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [datePickerType === 'planting' ? 'planting_date' : 'expected_harvest_date']: selectedDate,
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Crops</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openModal()}
        >
          <Ionicons name="add" size={24} color={Colors.light.background} />
        </TouchableOpacity>
      </View>

      {/* Crops List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {crops.length > 0 ? (
            crops.map((crop, index) => (
              <Animatable.View
                key={crop.id}
                animation="fadeInUp"
                delay={index * 100}
                style={styles.cropCard}
              >
                <View style={styles.cropHeader}>
                  <View style={styles.cropInfo}>
                    <Text style={styles.cropName}>{crop.name}</Text>
                    {crop.variety && (
                      <Text style={styles.cropVariety}>{crop.variety}</Text>
                    )}
                  </View>
                  <View style={styles.cropActions}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(crop.status) }]}>
                      <Ionicons
                        name={getStatusIcon(crop.status) as any}
                        size={16}
                        color={Colors.light.background}
                        style={styles.statusIcon}
                      />
                      <Text style={styles.statusText}>{crop.status}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cropDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.light.textSecondary} />
                    <Text style={styles.detailText}>
                      Planted: {new Date(crop.planting_date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {crop.expected_harvest_date && (
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={Colors.light.textSecondary} />
                      <Text style={styles.detailText}>
                        Expected Harvest: {new Date(crop.expected_harvest_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {crop.field_location && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color={Colors.light.textSecondary} />
                      <Text style={styles.detailText}>Location: {crop.field_location}</Text>
                    </View>
                  )}

                  {crop.area_planted && (
                    <View style={styles.detailRow}>
                      <Ionicons name="resize-outline" size={16} color={Colors.light.textSecondary} />
                      <Text style={styles.detailText}>Area: {crop.area_planted} acres</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cropFooter}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openModal(crop)}
                  >
                    <Ionicons name="create-outline" size={20} color={Colors.light.primary} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(crop)}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={64} color={Colors.light.textSecondary} />
              <Text style={styles.emptyText}>No crops yet</Text>
              <Text style={styles.emptySubtext}>Add your first crop to get started!</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => openModal()}
              >
                <Text style={styles.emptyButtonText}>Add Crop</Text>
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
              {editingCrop ? 'Edit Crop' : 'Add Crop'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Crop Name *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter crop name"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Variety</Text>
              <TextInput
                style={styles.formInput}
                value={formData.variety}
                onChangeText={(text) => setFormData(prev => ({ ...prev, variety: text }))}
                placeholder="Enter variety (optional)"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Planting Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('planting');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateText}>
                  {formData.planting_date.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Expected Harvest Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('harvest');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateText}>
                  {formData.expected_harvest_date.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Field Location</Text>
              <TextInput
                style={styles.formInput}
                value={formData.field_location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, field_location: text }))}
                placeholder="Enter field location"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Area Planted (acres)</Text>
              <TextInput
                style={styles.formInput}
                value={formData.area_planted}
                onChangeText={(text) => setFormData(prev => ({ ...prev, area_planted: text }))}
                placeholder="Enter area in acres"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Status</Text>
              <View style={styles.statusOptions}>
                {['planted', 'growing', 'harvested', 'failed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      formData.status === status && styles.statusOptionSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, status }))}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        formData.status === status && styles.statusOptionTextSelected,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Enter notes (optional)"
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
            value={datePickerType === 'planting' ? formData.planting_date : formData.expected_harvest_date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  cropCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
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
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  cropVariety: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  cropActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusIcon: {
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.background,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  cropDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.sm,
  },
  cropFooter: {
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
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statusOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statusOptionSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  statusOptionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  statusOptionTextSelected: {
    color: Colors.light.background,
    fontWeight: Typography.fontWeight.medium,
  },
});