
import { Session, User } from '@supabase/supabase-js';

export interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, inviteCode?: string, captchaToken?: string) => Promise<{ error: any | null, userExists?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  checkUserRole: () => Promise<void>;
}
