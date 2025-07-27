import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';


interface ProfileUpdate {
  full_name?: string;
  avatar_url?: string;
  farm_name?: string;
  farm_location?: string;
  farm_size?: string;
  phone?: string;
  farming_experience?: string;
}

interface AuthError {
  message: string;
  status?: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: AuthError }>;
  signUpWithOTP: (email: string, fullName: string) => Promise<{ error?: AuthError }>;
  verifyOTP: (email: string, token: string, password: string, fullName: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<{ error?: AuthError }>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: { message: error.message } };

      set({ user: data.user, session: data.session });
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('Auth signup error:', error);
        return { error: { message: error.message } };
      }

      // Create profile
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't return error here as auth user was created successfully
            // The profile can be created later
          }
        } catch (profileErr) {
          console.error('Profile creation exception:', profileErr);
        }
      }

      set({ user: data.user, session: data.session });
      return {};
    } catch (error) {
      console.error('Signup exception:', error);
      return { error: { message: error instanceof Error ? error.message : 'An unexpected error occurred during signup' } };
    }
  },

  signUpWithOTP: async (email: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return { error: { message: error.message } };
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  },

  verifyOTP: async (email: string, token: string, password?: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (error) {
        console.error('OTP verification error:', error);
        return { error: { message: error.message } };
      }

      if (data.user) {
        // Update password if provided
        if (password) {
          const { error: passwordError } = await supabase.auth.updateUser({
            password: password,
          });

          if (passwordError) {
            console.error('Password update error:', passwordError);
          }
        }

        // Create or update profile
        if (fullName) {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                full_name: fullName,
                email: email,
                updated_at: new Date().toISOString(),
              });

            if (profileError) {
              console.error('Profile creation/update error:', profileError);
              // Don't return error here as auth user was verified successfully
            }
          } catch (profileErr) {
            console.error('Profile creation/update exception:', profileErr);
          }
        }

        set({ user: data.user, session: data.session });
      }

      return {};
    } catch (err) {
      console.error('OTP verification exception:', err);
      return { error: { message: err instanceof Error ? err.message : 'An unexpected error occurred during verification' } };
    }
  },

  signOut: async () => {
    try {
      console.log('🔄 [AUTH] Starting sign out process...');
      
      // Clear the state first
      set({ user: null, session: null });
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ [AUTH] Sign out error:', error);
        throw error;
      }
      
      console.log('✅ [AUTH] Sign out successful');
    } catch (error) {
      console.error('💥 [AUTH] Sign out error:', error);
      // Still clear local state even if Supabase signOut fails
      set({ user: null, session: null });
      throw error;
    }
  },

  updateProfile: async (updates: ProfileUpdate) => {
    console.log('🔄 [AUTH] Starting updateProfile function...');
    console.log('📝 [AUTH] Received updates:', updates);
    
    try {
      const { user } = get();
      if (!user) {
        console.error('❌ [AUTH] No user found');
        return { error: { message: 'No user found' } };
      }

      console.log('👤 [AUTH] Current user:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
      });

      // Prepare data for profiles table (matching schema)
      const profileData: any = {};
      if (updates.full_name) profileData.full_name = updates.full_name;
      if (updates.farm_name) profileData.farm_name = updates.farm_name;
      if (updates.farm_location) profileData.farm_location = updates.farm_location;
      if (updates.farm_size) profileData.farm_size = updates.farm_size;

      console.log('🗄️ [AUTH] Profile data for database (matching schema):', profileData);
      console.log('📋 [AUTH] Schema fields: id, email, full_name, avatar_url, farm_name, farm_location, farm_size, created_at, updated_at');

      // Update profiles table
      console.log('🔄 [AUTH] Updating profiles table...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ [AUTH] Profile table update failed:', profileError);
        return { error: { message: profileError.message } };
      }

      console.log('✅ [AUTH] Profile table updated successfully');

      // Update user metadata for additional fields
      const metadataUpdates: any = {};
      if (updates.full_name) metadataUpdates.full_name = updates.full_name;
      if (updates.phone) metadataUpdates.phone = updates.phone;
      if (updates.farm_location) metadataUpdates.location = updates.farm_location;
      if (updates.farm_size) metadataUpdates.farm_size = updates.farm_size;
      if (updates.farming_experience) metadataUpdates.farming_experience = updates.farming_experience;

      console.log('📊 [AUTH] Metadata updates:', metadataUpdates);

      if (Object.keys(metadataUpdates).length > 0) {
        console.log('🔄 [AUTH] Updating user metadata...');
        const { error: metadataError } = await supabase.auth.updateUser({
          data: metadataUpdates
        });

        if (metadataError) {
          console.warn('⚠️ [AUTH] Metadata update failed:', metadataError.message);
          // Don't return error as profile was updated successfully
        } else {
          console.log('✅ [AUTH] User metadata updated successfully');
        }
      }

      console.log('🎉 [AUTH] Profile update completed successfully');
      return {};
    } catch (error) {
      console.error('💥 [AUTH] Exception in updateProfile:', error);
      console.error('📋 [AUTH] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user || null, session, loading: false });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        set({ user: session?.user || null, session });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },
}));