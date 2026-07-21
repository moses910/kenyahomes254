import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase-client";
import { z } from "zod";

export default defineTool({
  name: "get_property",
  title: "Get property details",
  description: "Fetch full details for a single KenyaHomes property by id.",
  inputSchema: {
    property_id: z.string().uuid().describe("Property UUID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ property_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("properties")
      .select("*, property_photos(storage_path,ordering)")
      .eq("id", property_id)
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Property not found" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { property: data },
    };
  },
});
