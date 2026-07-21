import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

// Read env from the Deno/edge runtime without referencing bare `process`
// (which is a Node-only global that the browser tsconfig does not know).
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export function supabaseForUser(ctx: ToolContext): SupabaseClient {
  return createClient(env.SUPABASE_URL ?? "", env.SUPABASE_PUBLISHABLE_KEY ?? "", {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
