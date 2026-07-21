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
  name: "unsave_property",
  title: "Remove a saved property",
  description: "Remove a property from the signed-in user's saved list.",
  inputSchema: {
    property_id: z.string().uuid().describe("Property UUID to unsave."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ property_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { error } = await supabaseForUser(ctx)
      .from("saved_properties")
      .delete()
      .eq("user_id", ctx.getUserId())
      .eq("property_id", property_id);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Removed property ${property_id} from saved list` }] };
  },
});
