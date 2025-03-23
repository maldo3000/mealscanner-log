
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface UseAuthFormResult {
  isLogin: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  passwordsMatch: boolean;
  showVerificationAlert: boolean;
  showResetPasswordForm: boolean;
  authError: string | null;
  loginAttempts: number;
  loading: boolean;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setAcceptedTerms: (accepted: boolean) => void;
  toggleAuthMode: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handlePasswordReset: (e: React.FormEvent) => Promise<void>;
  showPasswordResetForm: () => void;
  hidePasswordResetForm: () => void;
}

export const useAuthForm = (): UseAuthFormResult => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { signIn, signUp, resetPassword, loading } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!isLogin) {
      setPasswordsMatch(confirmPassword === password || confirmPassword === '');
    }
  }, [password, confirmPassword, isLogin]);

  // Check if we should show the verification message based on URL params
  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setShowVerificationAlert(true);
      // Remove the query param to avoid showing the message after page refreshes
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check if we're coming back from a password reset
    if (searchParams.get('reset') === 'true') {
      toast.success('You can now create a new password by signing in with the link in your email.');
      // Remove the query param
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!isLogin) {
      // Signup validation
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (!acceptedTerms) {
        toast.error('You must accept the Terms of Service');
        return;
      }
      
      const result = await signUp(email, password);
      if (result.error) {
        // If the user already exists, show a helpful message
        if (result.userExists) {
          setAuthError('An account with this email already exists. Sign in or reset your password.');
        } else {
          setAuthError(result.error.message || 'Error signing up');
        }
      }
    } else {
      // Login flow
      if (loginAttempts >= 5) {
        setAuthError('Too many login attempts. Please try again later.');
        toast.error('Too many login attempts. Please try again later.');
        return;
      }
      
      const result = await signIn(email, password);
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
      // Hide the password reset form after successful submission
      setShowResetPasswordForm(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPassword('');
    setConfirmPassword('');
    setAcceptedTerms(false);
    setAuthError(null);
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
    acceptedTerms,
    passwordsMatch,
    showVerificationAlert,
    showResetPasswordForm,
    authError,
    loginAttempts,
    loading,
    setEmail,
    setPassword,
    setConfirmPassword,
    setAcceptedTerms,
    toggleAuthMode,
    handleSubmit,
    handlePasswordReset,
    showPasswordResetForm,
    hidePasswordResetForm
  };
};
