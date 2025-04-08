
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseAuthFormResult {
  isLogin: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
  acceptedTerms: boolean;
  passwordsMatch: boolean;
  showVerificationAlert: boolean;
  showResetPasswordForm: boolean;
  authError: string | null;
  inviteCodeError: string | null;
  inviteRequired: boolean;
  loginAttempts: number;
  loading: boolean;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setInviteCode: (inviteCode: string) => void;
  setAcceptedTerms: (accepted: boolean) => void;
  toggleAuthMode: () => void;
  handleSubmit: (e: React.FormEvent, captchaToken?: string) => Promise<void>;
  handlePasswordReset: (e: React.FormEvent) => Promise<void>;
  showPasswordResetForm: () => void;
  hidePasswordResetForm: () => void;
}

export const useAuthForm = (): UseAuthFormResult => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteCodeError, setInviteCodeError] = useState<string | null>(null);
  const [inviteRequired, setInviteRequired] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { signIn, signUp, resetPassword, loading } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkInviteStatus = async () => {
      try {
        console.log("Checking if invite-only registration is enabled...");
        const { data: settings, error } = await supabase
          .from('app_settings')
          .select('invite_only_registration')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.error("Error fetching app settings:", error);
          return;
        }
        
        if (settings) {
          console.log("Invite-only registration setting:", settings.invite_only_registration);
          setInviteRequired(settings.invite_only_registration);
        } else {
          console.log("No app settings found, defaulting to require invites");
          setInviteRequired(true); // Default to requiring invites if no settings found
        }
      } catch (error) {
        console.error('Error checking invite status:', error);
      }
    };

    checkInviteStatus();
  }, [isLogin]); // Re-check when toggling between login and signup

  useEffect(() => {
    if (!isLogin) {
      setPasswordsMatch(confirmPassword === password || confirmPassword === '');
    }
  }, [password, confirmPassword, isLogin]);

  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setShowVerificationAlert(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (searchParams.get('reset') === 'true') {
      toast.success('You can now create a new password by signing in with the link in your email.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const validateInviteCode = async () => {
    if (!inviteRequired) {
      console.log("Invite code not required, skipping validation");
      return true;
    }
    
    if (!inviteCode.trim()) {
      console.log("No invite code provided");
      setInviteCodeError('Invite code is required');
      return false;
    }

    try {
      console.log("Validating invite code:", inviteCode);
      const { data, error } = await supabase.rpc('validate_invite_code', {
        code_to_check: inviteCode.trim()
      });

      if (error) {
        console.error("Invite code validation error:", error);
        throw error;
      }

      console.log("Invite code validation result:", data);
      if (!data) {
        setInviteCodeError('Invalid or expired invite code');
        return false;
      }

      setInviteCodeError(null);
      return true;
    } catch (error) {
      console.error('Error validating invite code:', error);
      setInviteCodeError('Error validating invite code');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent, captchaToken?: string) => {
    e.preventDefault();
    setAuthError(null);
    setInviteCodeError(null);
    
    if (!isLogin) {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (!acceptedTerms) {
        toast.error('You must accept the Terms of Service');
        return;
      }

      if (!captchaToken) {
        toast.error('Please verify that you are human');
        return;
      }

      if (inviteRequired) {
        const isValid = await validateInviteCode();
        if (!isValid) return;
      }
      
      const result = await signUp(email, password, inviteCode, captchaToken);
      if (result.error) {
        if (result.userExists) {
          setAuthError('An account with this email already exists. Sign in or reset your password.');
        } else {
          setAuthError(result.error.message || 'Error signing up');
        }
      }
    } else {
      if (loginAttempts >= 5) {
        setAuthError('Too many login attempts. Please try again later.');
        toast.error('Too many login attempts. Please try again later.');
        return;
      }
      
      if (!captchaToken) {
        toast.error('Please verify that you are human');
        return;
      }
      
      const result = await signIn(email, password, captchaToken);
      if (result.error) {
        setLoginAttempts(prev => prev + 1);
        if (result.error.message === 'Invalid login credentials') {
          setAuthError('Incorrect email or password');
        } else if (result.error.message?.includes('rate limit')) {
          setAuthError('Too many login attempts. Please try again later.');
        } else {
          setAuthError(result.error.message || 'Error signing in');
        }
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    const result = await resetPassword(email);
    if (!result.error) {
      setShowResetPasswordForm(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPassword('');
    setConfirmPassword('');
    setInviteCode('');
    setAcceptedTerms(false);
    setAuthError(null);
    setInviteCodeError(null);
    setLoginAttempts(0);
    setShowResetPasswordForm(false);
  };

  const showPasswordResetForm = () => {
    setShowResetPasswordForm(true);
    setAuthError(null);
  };

  const hidePasswordResetForm = () => {
    setShowResetPasswordForm(false);
  };

  return {
    isLogin,
    email,
    password,
    confirmPassword,
    inviteCode,
    acceptedTerms,
    passwordsMatch,
    showVerificationAlert,
    showResetPasswordForm,
    authError,
    inviteCodeError,
    inviteRequired,
    loginAttempts,
    loading,
    setEmail,
    setPassword,
    setConfirmPassword,
    setInviteCode,
    setAcceptedTerms,
    toggleAuthMode,
    handleSubmit,
    handlePasswordReset,
    showPasswordResetForm,
    hidePasswordResetForm
  };
};
