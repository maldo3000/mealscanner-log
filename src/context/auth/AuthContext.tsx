
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthContextProps } from './types';
import { authService } from './authService';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Function to check if the current user has admin role
  const checkUserRole = async () => {
    await authService.checkUserRole(user, setIsAdmin);
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
    return authService.signIn(email, password, navigate, setLoading);
  };

  const signUp = async (email: string, password: string, inviteCode: string = '', captchaToken: string = '') => {
    return authService.signUp(email, password, inviteCode, captchaToken, navigate, setLoading);
  };

  const resetPassword = async (email: string) => {
    return authService.resetPassword(email, setLoading);
  };

  const signOut = async () => {
    return authService.signOut(setLoading, setUser, setSession, setIsAdmin, navigate);
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
