import { supabase } from '../lib/supabase';

export interface ImageUploadResult {
  url: string;
  path: string;
}

export const uploadImage = async (
  uri: string,
  bucket: string,
  folder: string,
  fileName?: string
): Promise<ImageUploadResult | null> => {
  try {
    // Generate unique filename if not provided
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const finalFileName = fileName || `${timestamp}_${randomString}.jpg`;
    const filePath = `${folder}/${finalFileName}`;

    // Convert URI to blob for upload
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return null;
  }
};

export const deleteImage = async (bucket: string, path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Image delete error:', error);
    return false;
  }
};

export const getImageUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

// Crop-specific image functions
export const uploadCropImage = async (uri: string, cropId: string): Promise<ImageUploadResult | null> => {
  return uploadImage(uri, 'crop-images', 'crops', `crop_${cropId}_${Date.now()}.jpg`);
};

export const deleteCropImage = async (path: string): Promise<boolean> => {
  return deleteImage('crop-images', path);
};

// Profile image functions
export const uploadProfileImage = async (uri: string, userId: string): Promise<ImageUploadResult | null> => {
  return uploadImage(uri, 'profile-images', 'profiles', `profile_${userId}.jpg`);
};

export const deleteProfileImage = async (path: string): Promise<boolean> => {
  return deleteImage('profile-images', path);
};