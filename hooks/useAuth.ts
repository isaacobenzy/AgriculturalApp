import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';


interface ProfileUpdate {
  full_name?: string;
  avatar_url?: string;
  farm_name?: string;
  farm_location?: string;
  farm_size?: number;
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
      await supabase.auth.signOut();
      set({ user: null, session: null });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  updateProfile: async (updates: ProfileUpdate) => {
    try {
      const { user } = get();
      if (!user) return { error: { message: 'No user found' } };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      return { error: error ? { message: error.message } : undefined };
    } catch (error) {
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