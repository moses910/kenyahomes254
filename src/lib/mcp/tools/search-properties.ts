import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase-client";
import { z } from "zod";

export default defineTool({
  name: "search_properties",
  title: "Search properties",
  description:
    "Search published property listings on KenyaHomes. Filter by city, price range, minimum beds/baths, and sale vs rent.",
  inputSchema: {
    city: z.string().trim().optional().describe("City name substring, e.g. 'Nairobi'."),
    min_price: z.number().nonnegative().optional().describe("Minimum price in KES."),
    max_price: z.number().nonnegative().optional().describe("Maximum price in KES."),
    min_beds: z.number().int().nonnegative().optional(),
    min_baths: z.number().int().nonnegative().optional(),
    for_rent: z.boolean().optional().describe("true = rentals, false = for sale. Omit for both."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("properties")
      .select("id,title,price,currency,for_rent,beds,baths,city,address,region,area_sqft")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(input.limit ?? 20);

    if (input.city) q = q.ilike("city", `%${input.city}%`);
    if (input.min_price !== undefined) q = q.gte("price", input.min_price);
    if (input.max_price !== undefined) q = q.lte("price", input.max_price);
    if (input.min_beds !== undefined) q = q.gte("beds", input.min_beds);
    if (input.min_baths !== undefined) q = q.gte("baths", input.min_baths);
    if (input.for_rent !== undefined) q = q.eq("for_rent", input.for_rent);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { properties: data ?? [] },
    };
  },
});
