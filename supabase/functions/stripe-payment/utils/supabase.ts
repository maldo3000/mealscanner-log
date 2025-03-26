
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Interface for Supabase configuration
export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

// Create a Supabase client with the provided configuration
export const createSupabaseClient = (config: SupabaseConfig) => {
  return createClient(
    config.url,
    config.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
