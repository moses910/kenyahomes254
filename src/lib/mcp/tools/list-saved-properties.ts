import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase-client";

export default defineTool({
  name: "list_saved_properties",
  title: "List my saved properties",
  description: "List the signed-in user's saved (favourited) properties on KenyaHomes.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("saved_properties")
      .select("id, created_at, properties(id,title,price,currency,for_rent,beds,baths,city,address)")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false });

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { saved: data ?? [] },
    };
  },
});
