
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null, userExists?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  checkUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Function to check if the current user has admin role
  const checkUserRole = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      console.log("Checking if user has admin role:", user.email);
      const { data, error } = await supabase.rpc('has_role', { 
        _role: 'admin' 
      });

      if (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
        return;
      }

      console.log("Admin role check result:", data);
      setIsAdmin(data || false);
    } catch (error) {
      console.error('Failed to check user role:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check admin role whenever the user changes
  useEffect(() => {
    if (user) {
      console.log("User changed, checking role for:", user.email);
      checkUserRole();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast.success('Successfully signed in');
      navigate('/home');
      return { error: null };
    } catch (error: any) {
      let errorMessage = 'Error signing in';
      
      // Handle specific error types
      if (error.message === 'Invalid login credentials') {
        errorMessage = 'Incorrect email or password';
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Too many login attempts. Please try again later.';
      }
      
      toast.error(errorMessage);
      console.error('Error signing in:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        // Check if the error is due to the user already existing
        if (error.message?.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in or reset your password.');
          return { error, userExists: true };
        }
        throw error;
      }
      
      if (data.user) {
        toast.success('Registration successful! Please check your email for the verification link and then return to sign in.', {
          duration: 6000, // Show for 6 seconds to ensure it's seen
        });
        // Add a URL parameter so we can show the verification alert
        navigate('/auth?signup=success');
      } else {
        toast.error('Something went wrong during signup');
      }
      return { error: null };
    } catch (error: any) {
      toast.error(error.message || 'Error signing up');
      console.error('Error signing up:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password reset link sent to your email', {
        duration: 6000,
      });
      return { error: null };
    } catch (error: any) {
      toast.error(error.message || 'Error sending password reset link');
      console.error('Error sending password reset link:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!session,
    isAdmin,
    checkUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
