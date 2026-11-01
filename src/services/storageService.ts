import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { CityId } from '../types';

export interface UploadImageResult {
  url: string | null;
  path: string | null;
  error?: string;
}

const BUCKET_NAME = 'business-images';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const storageService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async uploadBusinessImage(
    file: File,
    cityId: CityId,
    businessId: string = 'new'
  ): Promise<UploadImageResult> {
    // 1. Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        url: null,
        path: null,
        error: 'Invalid file format. Only JPEG, PNG, and WebP images are permitted.',
      };
    }

    // 2. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        url: null,
        path: null,
        error: 'File size exceeds 5MB limit. Please choose a smaller image.',
      };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local fallback: create an object URL for preview
      const previewUrl = URL.createObjectURL(file);
      return {
        url: previewUrl,
        path: `local/${cityId}/${Date.now()}_${file.name}`,
      };
    }

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${cityId}/${businessId}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return { url: null, path: null, error: error.message };
      }

      // 1. Try generating a signed URL for private bucket access (valid for 1 year)
      let resolvedUrl: string | null = null;
      try {
        const { data: signedData, error: signError } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 year
        if (!signError && signedData?.signedUrl) {
          resolvedUrl = signedData.signedUrl;
        }
      } catch {
        // Silently fall back to standard public URL resolution
      }

      // 2. Fall back to standard public URL if signed URL unavailable
      if (!resolvedUrl) {
        const { data: publicData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(data.path);
        resolvedUrl = publicData.publicUrl;
      }

      return {
        url: resolvedUrl,
        path: data.path,
      };
    } catch (err) {
      return {
        url: null,
        path: null,
        error: err instanceof Error ? err.message : 'Image upload failed.',
      };
    }
  },

  async getSignedImageUrl(storagePath: string, expiresInSeconds: number = 3600 * 24 * 7): Promise<string | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(storagePath, expiresInSeconds);
      if (error || !data) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  },

  async deleteBusinessImage(storagePath: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete image.' };
    }
  },
};

