import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Typography, BorderRadius } from '../constants';
import { Card, Button } from './ui';
import { uploadCropImage, deleteCropImage } from '../services/imageService';
import { supabase } from '../lib/supabase';

interface CropPhoto {
  id: string;
  photo_url: string;
  description?: string;
  taken_at: string;
}

interface CropPhotoManagerProps {
  cropId: string;
  userId: string;
  photos: CropPhoto[];
  onPhotosUpdate: (photos: CropPhoto[]) => void;
}

export const CropPhotoManager: React.FC<CropPhotoManagerProps> = ({
  cropId,
  userId,
  photos,
  onPhotosUpdate,
}) => {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    try {
      setUploading(true);

      // Create form data for upload
      const formData = new FormData();
      const filename = `crop_${cropId}_${Date.now()}.jpg`;
      
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: filename,
      } as any);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('crop-photos')
        .upload(filename, formData);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('crop-photos')
        .getPublicUrl(filename);

      // Save photo record to database
      const { data: photoData, error: dbError } = await supabase
        .from('crop_photos')
        .insert({
          crop_id: cropId,
          user_id: userId,
          photo_url: publicUrl,
          taken_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local state
      onPhotosUpdate([...photos, photoData]);
      
      Alert.alert('Success', 'Photo uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: string, photoUrl: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from database
              const { error: dbError } = await supabase
                .from('crop_photos')
                .delete()
                .eq('id', photoId);

              if (dbError) throw dbError;

              // Delete from storage
              const filename = photoUrl.split('/').pop();
              if (filename) {
                await supabase.storage
                  .from('crop-photos')
                  .remove([filename]);
              }

              // Update local state
              onPhotosUpdate(photos.filter(photo => photo.id !== photoId));
            } catch (error: any) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete photo.');
            }
          },
        },
      ]
    );
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
      ]
    );
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crop Photos</Text>
        <Button
          title="Add Photo"
          onPress={showPhotoOptions}
          size="small"
          loading={uploading}
          leftIcon="camera"
        />
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>Add photos to track your crop's progress</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoContainer}>
              <Image source={{ uri: photo.photo_url }} style={styles.photo} />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePhoto(photo.id, photo.photo_url)}
              >
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </TouchableOpacity>
              <Text style={styles.photoDate}>
                {new Date(photo.taken_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.medium,
  },
  title: {
    ...Typography.heading3,
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.large,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.small,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.small,
    textAlign: 'center',
  },
  photoList: {
    marginHorizontal: -Spacing.medium,
  },
  photoContainer: {
    marginLeft: Spacing.medium,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 90,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.border,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  photoDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.small,
  },
});