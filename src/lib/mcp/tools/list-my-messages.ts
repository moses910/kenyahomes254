import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_my_messages",
  title: "List my messages",
  description:
    "List inquiry messages the signed-in user has sent (as a seeker) or received (as the listing agent).",
  inputSchema: {
    role: z.enum(["sent", "received", "all"]).optional().describe("Filter by role (default 'all')."),
    limit: z.number().int().min(1).max(100).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ role = "all", limit = 25 }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const uid = ctx.getUserId();
    let q = supabaseForUser(ctx)
      .from("messages")
      .select("id, property_id, seeker_id, agent_id, body, email, phone, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (role === "sent") q = q.eq("seeker_id", uid);
    else if (role === "received") q = q.eq("agent_id", uid);
    else q = q.or(`seeker_id.eq.${uid},agent_id.eq.${uid}`);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { messages: data ?? [] },
    };
  },
});
