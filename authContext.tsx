import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, UserProfile } from './supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  verifyDriver: (licenseNumber: string, fullName: string) => Promise<{
    success: boolean;
    error: Error | null;
    message?: string;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile when user changes
  useEffect(() => {
    async function getProfile() {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    getProfile();
  }, [user]);

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (!error) {
      // Create an initial profile after sign up
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        await supabase.from('profiles').insert({
          user_id: user.id,
          full_name: email.split('@')[0], // Default name from email
          join_date: new Date().toISOString().split('T')[0],
          is_verified: false,
          rating: 5.0,
        });
      }
    }

    return { error };
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('User not logged in') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user.id);

      if (error) {
        return { error };
      }

      // Update local profile state
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Verify driver license
  const verifyDriver = async (licenseNumber: string, fullName: string) => {
    if (!user) {
      return { 
        success: false, 
        error: new Error('User not logged in'),
        message: 'You must be logged in to verify your account'
      };
    }

    try {
      // This would be a call to a real verification API
      // For demo purposes, we'll use the mock data from VerificationDemo.tsx
      const mockTLCDatabase = {
        'TLC-12345678': { name: 'John Smith', status: 'Active', expirationDate: '2025-12-31' },
        'TLC-87654321': { name: 'Sara Johnson', status: 'Active', expirationDate: '2025-10-15' }
      };

      // Check if license exists and is valid
      const licenseData = mockTLCDatabase[licenseNumber as keyof typeof mockTLCDatabase];
      
      if (!licenseData) {
        return { 
          success: false, 
          error: null,
          message: 'TLC license not found in database'
        };
      }

      if (licenseData.status !== 'Active') {
        return { 
          success: false, 
          error: null,
          message: 'TLC license is not active'
        };
      }

      // Basic name matching (case-insensitive)
      if (licenseData.name.toLowerCase() !== fullName.toLowerCase()) {
        return { 
          success: false, 
          error: null,
          message: 'Name does not match TLC license records'
        };
      }

      // Update profile with verified status
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: true,
          license_number: licenseNumber
        })
        .eq('user_id', user.id);

      if (error) {
        return { 
          success: false, 
          error,
          message: 'Error updating verification status'
        };
      }

      // Update local profile
      setProfile(prev => prev ? { 
        ...prev, 
        is_verified: true,
        license_number: licenseNumber
      } : null);

      return { 
        success: true, 
        error: null,
        message: 'Driver verified successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error as Error,
        message: 'An unexpected error occurred'
      };
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    verifyDriver,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}