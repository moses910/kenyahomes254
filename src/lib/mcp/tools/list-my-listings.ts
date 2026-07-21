import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase-client";

export default defineTool({
  name: "list_my_listings",
  title: "List my property listings",
  description:
    "For agents: list all property listings owned by the signed-in user, including drafts and unpublished listings.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("properties")
      .select("id,title,status,price,currency,for_rent,beds,baths,city,address,created_at")
      .eq("agent_id", ctx.getUserId())
      .order("created_at", { ascending: false });

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { listings: data ?? [] },
    };
  },
});
