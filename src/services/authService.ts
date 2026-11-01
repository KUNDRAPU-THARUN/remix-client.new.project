import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { UserAccount, CityId } from '../types';

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'customer' | 'provider';
  cityId?: CityId;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserAccount | null;
  error?: string;
}

export const authService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async signUp(params: SignUpParams): Promise<AuthResponse> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // In development fallback mode without Supabase credentials
      const mockUser: UserAccount = {
        id: `user-${Date.now()}`,
        username: params.email.split('@')[0],
        email: params.email,
        role: params.role,
        name: params.fullName,
        mobile: params.phone || '',
        cityId: params.cityId || 'chittoor',
      };
      return { user: mockUser };
    }

    try {
      // Security guard: Ensure public signups can only ever request 'customer' or 'business_owner'
      const dbRole = params.role === 'provider' ? 'business_owner' : 'customer';

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            display_name: params.fullName.trim(),
            phone: params.phone?.trim() || null,
            role: dbRole,
            city_id: params.cityId || 'chittoor',
          },
        },
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Registration succeeded, but no user record was returned.' };
      }

      // Upsert user profile
      const { error: profileError } = await supabase.from('user_profiles').upsert({
        id: authData.user.id,
        display_name: params.fullName.trim(),
        email: params.email.trim(),
        phone: params.phone?.trim() || null,
        city_id: params.cityId || 'chittoor',
        account_status: 'active',
      });

      if (profileError) {
        console.warn('Profile sync notice:', profileError.message);
      }

      // Record user role in user_roles
      await supabase.from('user_roles').upsert({
        user_id: authData.user.id,
        city_id: params.cityId || 'chittoor',
        role: dbRole,
      });

      const userAccount: UserAccount = {
        id: authData.user.id,
        username: params.email.split('@')[0],
        email: authData.user.email || params.email,
        role: params.role,
        name: params.fullName,
        mobile: params.phone,
        cityId: params.cityId || 'chittoor',
      };

      return { user: userAccount };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed unexpectedly.';
      return { user: null, error: msg };
    }
  },

  async signIn(params: SignInParams): Promise<AuthResponse> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // In development fallback mode without Supabase credentials
      const username = params.email.split('@')[0];
      const mockUser: UserAccount = {
        id: `user-${Date.now()}`,
        username,
        email: params.email,
        role: 'provider',
        name: username,
        mobile: '9440218456',
        cityId: 'chittoor',
      };
      return { user: mockUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email.trim(),
        password: params.password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'User session could not be established.' };
      }

      return await this.fetchUserAccount(data.user.id, data.user.email || params.email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed unexpectedly.';
      return { user: null, error: msg };
    }
  },

  async signOut(): Promise<{ error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) return {};

    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { error: error.message };
      return {};
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign out failed.' };
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to send reset link.' };
    }
  },

  async fetchUserAccount(userId: string, defaultEmail: string): Promise<AuthResponse> {
    const supabase = getSupabaseClient();
    if (!supabase) return { user: null };

    try {
      // Query user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Query user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const isProvider = roles?.some(
        (r) => r.role === 'business_owner' || r.role === 'city_franchise' || r.role === 'super_admin'
      );

      const userAccount: UserAccount = {
        id: userId,
        username: defaultEmail.split('@')[0],
        email: profile?.email || defaultEmail,
        name: profile?.display_name || defaultEmail.split('@')[0],
        mobile: profile?.phone || undefined,
        role: isProvider ? 'provider' : 'customer',
        cityId: (profile?.city_id as CityId) || 'chittoor',
      };

      return { user: userAccount };
    } catch (err) {
      console.warn('Could not fetch user account profile:', err);
      return {
        user: {
          id: userId,
          username: defaultEmail.split('@')[0],
          email: defaultEmail,
          name: defaultEmail.split('@')[0],
          role: 'customer',
        },
      };
    }
  },

  async restoreSession(): Promise<UserAccount | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;

      const res = await this.fetchUserAccount(session.user.id, session.user.email || '');
      return res.user;
    } catch (err) {
      console.warn('Session restoration failed:', err);
      return null;
    }
  },
};

