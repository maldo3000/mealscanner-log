
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';

export const authService = {
  signIn: async (
    email: string, 
    password: string, 
    navigate: NavigateFunction, 
    setLoading: (loading: boolean) => void
  ) => {
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
  },

  signUp: async (
    email: string, 
    password: string, 
    inviteCode: string = '',
    captchaToken: string = '',
    navigate: NavigateFunction, 
    setLoading: (loading: boolean) => void
  ) => {
    try {
      setLoading(true);
      
      // First, check if we need to validate an invite code
      const { data: settings } = await supabase
        .from('app_settings')
        .select('invite_only_registration')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      const inviteRequired = settings?.invite_only_registration;
      console.log("Invite required for registration:", inviteRequired);
      
      // If invite is required, validate the code before sign up
      if (inviteRequired && inviteCode) {
        console.log("Validating invite code:", inviteCode);
        const { data: isValid, error: validationError } = await supabase.rpc(
          'validate_invite_code', 
          { code_to_check: inviteCode }
        );
        
        console.log("Invite code validation result:", isValid, validationError);
        
        if (validationError || !isValid) {
          toast.error('Invalid or expired invite code');
          return { error: new Error('Invalid or expired invite code') };
        }
      } else if (inviteRequired && !inviteCode) {
        toast.error('Invite code is required to register');
        return { error: new Error('Invite code is required to register') };
      }
      
      // Proceed with sign up, including captcha token
      const signUpOptions = captchaToken 
        ? { 
            email, 
            password, 
            options: { 
              captchaToken 
            } 
          } 
        : { email, password };
      
      const { error, data } = await supabase.auth.signUp(signUpOptions);
      
      if (error) {
        // Check if the error is due to the user already existing
        if (error.message?.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in or reset your password.');
          return { error, userExists: true };
        }
        throw error;
      }
      
      // If signup was successful and invite code was provided, mark it as used
      if (data.user && inviteRequired && inviteCode) {
        console.log("Marking invite code as used:", inviteCode, "for user:", email);
        const { data: useResult, error: useError } = await supabase.rpc('use_invite_code', {
          code_to_use: inviteCode,
          user_email: email
        });
        
        if (useError) {
          console.error("Error marking invite code as used:", useError);
        } else {
          console.log("Invite code marked as used:", useResult);
        }
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
  },

  resetPassword: async (
    email: string, 
    setLoading: (loading: boolean) => void
  ) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://www.mealscanner.app/email-confirmed`,
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
  },

  signOut: async (
    setLoading: (loading: boolean) => void,
    setUser: (user: null) => void,
    setSession: (session: null) => void,
    setIsAdmin: (isAdmin: boolean) => void,
    navigate: NavigateFunction
  ) => {
    try {
      setLoading(true);
      
      // First check if we have a session before trying to sign out
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // If no active session, just reset the local state and redirect
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        toast.success('Successfully signed out');
        navigate('/');
        return;
      }
      
      // If we have a session, perform the sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      
      // Even if sign out fails, reset the local state and redirect
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      toast.error(error.message || 'Error signing out');
      navigate('/');
    } finally {
      setLoading(false);
    }
  },

  checkUserRole: async (
    user: any, 
    setIsAdmin: (isAdmin: boolean) => void
  ) => {
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
  }
};
