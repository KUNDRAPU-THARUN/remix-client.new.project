import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { UserAccount, CityId } from '../types';
import { isCityId } from '../config/cities';

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
    const targetCityId: CityId = isCityId(params.cityId) ? params.cityId : 'chittoor';
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
        cityId: targetCityId,
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
            city_id: targetCityId,
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
        city_id: targetCityId,
        account_status: 'active',
      });

      if (profileError) {
        console.warn('Profile sync notice:', profileError.message);
      }

      // Record user role in user_roles
      await supabase.from('user_roles').upsert({
        user_id: authData.user.id,
        city_id: targetCityId,
        role: dbRole,
      });

      const userAccount: UserAccount = {
        id: authData.user.id,
        username: params.email.split('@')[0],
        email: authData.user.email || params.email,
        role: params.role,
        name: params.fullName,
        mobile: params.phone,
        cityId: targetCityId,
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
      // In production or preview, never simulate mock users; fail closed
      if (typeof import.meta !== 'undefined' && import.meta.env && !import.meta.env.DEV) {
        return { user: null, error: 'Authentication backend is not configured. Please contact administrator.' };
      }

      // In local development mock sandbox mode without Supabase credentials:
      // Strictly customer or provider; never grant super_admin or city_franchise from an email string
      const username = params.email.split('@')[0];
      const isCustomer = params.email.includes('customer');
      const targetCityId: CityId = params.email.includes('vellore')
        ? 'vellore'
        : params.email.includes('bengaluru')
        ? 'bengaluru'
        : 'chittoor';

      const roles: UserAccount['roles'] = isCustomer
        ? [{ role: 'customer', cityId: targetCityId }]
        : [{ role: 'business_owner', cityId: targetCityId }];

      const mockUser: UserAccount = {
        id: `user-${Date.now()}`,
        username,
        email: params.email,
        role: isCustomer ? 'customer' : 'provider',
        roles,
        franchiseCityId: null,
        isSuperAdmin: false,
        isFranchise: false,
        name: username,
        mobile: '9440218456',
        cityId: targetCityId,
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

  async updateUserProfile(
    userId: string,
    updates: { displayName?: string; phone?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true };
    }

    try {
      const payload: { display_name?: string; phone?: string } = {};
      if (updates.displayName !== undefined) payload.display_name = updates.displayName.trim();
      if (updates.phone !== undefined) payload.phone = updates.phone.trim();

      const { error } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', userId);

      if (error) return { success: false, error: error.message };

      // Sync metadata in auth session
      await supabase.auth.updateUser({
        data: {
          display_name: updates.displayName?.trim(),
          phone: updates.phone?.trim(),
        },
      }).catch(() => {});

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update profile.',
      };
    }
  },

  async fetchUserAccount(userId: string, defaultEmail: string): Promise<AuthResponse> {
    const supabase = getSupabaseClient();
    if (!supabase) return { user: null };

    try {
      // Query user profile
      const { data: profile, error: profileErr } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) {
        console.warn('Error fetching profile via RLS:', profileErr.message);
      }

      // Query user roles - server-enforced role table
      const { data: rolesData, error: rolesErr } = await supabase
        .from('user_roles')
        .select('role, city_id')
        .eq('user_id', userId);

      if (rolesErr) {
        console.warn('Error fetching user_roles via RLS:', rolesErr.message);
      }

      const roles: UserAccount['roles'] = (rolesData || []).map((r: any) => ({
        role: r.role,
        cityId: (r.city_id as CityId) || null,
      }));

      const isSuperAdmin = roles.some((r) => r.role === 'super_admin');
      const franchiseRole = roles.find((r) => r.role === 'city_franchise');
      const franchiseCityId = franchiseRole ? franchiseRole.cityId : (isSuperAdmin ? null : null);
      const isFranchise = Boolean(franchiseRole || isSuperAdmin);

      const isProvider = roles.some(
        (r) => r.role === 'business_owner' || r.role === 'city_franchise' || r.role === 'super_admin'
      );

      // Authoritative assigned city resolution:
      // Priority 1: user_profiles.city_id
      // Priority 2: first role with an assigned non-null cityId
      const profileCityId = (profile?.city_id as CityId) || null;
      const roleCityId = roles.find((r) => r.cityId)?.cityId || null;
      const resolvedCityId: CityId | undefined = (profileCityId || roleCityId || undefined);

      const userAccount: UserAccount = {
        id: userId,
        username: profile?.display_name || defaultEmail.split('@')[0],
        email: profile?.email || defaultEmail,
        name: profile?.display_name || defaultEmail.split('@')[0],
        mobile: profile?.phone || undefined,
        role: isProvider ? 'provider' : 'customer',
        roles,
        franchiseCityId,
        isSuperAdmin,
        isFranchise,
        cityId: resolvedCityId,
      };

      return { user: userAccount };
    } catch (err) {
      console.warn('Could not fetch user account profile:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load user account profile.';
      return { user: null, error: msg };
    }
  },

  async restoreSession(): Promise<UserAccount | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      // 1. Check local session presence (enables auto-refresh and token lifecycle)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) return null;

      // 2. Server-side identity verification via auth.getUser():
      // Cryptographically validates the bearer JWT against Supabase Auth server (/auth/v1/user)
      // to guarantee the user exists, is not revoked, expired or forged.
      const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !verifiedUser) {
        console.warn('Server-side identity verification failed:', userError?.message);
        await supabase.auth.signOut().catch(() => {});
        return null;
      }

      // 3. Load user account and roles from PostgreSQL via RLS using verified user ID
      const res = await this.fetchUserAccount(verifiedUser.id, verifiedUser.email || session.user.email || '');
      return res.user;
    } catch (err) {
      console.warn('Session restoration failed:', err);
      return null;
    }
  },
};

