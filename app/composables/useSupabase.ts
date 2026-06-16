import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function useSupabase(): SupabaseClient {
  if (!_client) {
    const config = useRuntimeConfig();
    _client = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey,
    );
  }
  return _client;
}
