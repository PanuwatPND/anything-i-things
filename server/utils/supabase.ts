import { createClient } from "@supabase/supabase-js";
import type { H3Event } from "h3";

export function serverSupabase(event: H3Event) {
  const config = useRuntimeConfig(event);
  return createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
  );
}
