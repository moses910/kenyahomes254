import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase-client";
import { z } from "zod";

export default defineTool({
  name: "save_property",
  title: "Save a property",
  description: "Save (favourite) a property for the signed-in user.",
  inputSchema: {
    property_id: z.string().uuid().describe("Property UUID to save."),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ property_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("saved_properties")
      .insert({ user_id: ctx.getUserId(), property_id })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Saved property ${property_id}` }],
      structuredContent: { saved: data },
    };
  },
});
