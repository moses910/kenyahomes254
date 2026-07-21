import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchProperties from "./tools/search-properties";
import getProperty from "./tools/get-property";
import listSavedProperties from "./tools/list-saved-properties";
import saveProperty from "./tools/save-property";
import unsaveProperty from "./tools/unsave-property";
import listMyListings from "./tools/list-my-listings";
import listMyMessages from "./tools/list-my-messages";

// Build the OAuth issuer from the direct Supabase host. The project ref is
// inlined by Vite at build time so this stays import-safe (no runtime env
// read). The fallback keeps the string well-formed during the throwaway
// manifest-extract eval, where no real token verifies against it.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "kenyahomes-mcp",
  title: "KenyaHomes",
  version: "0.1.0",
  instructions:
    "Tools to search KenyaHomes property listings and manage the signed-in user's saved properties, listings (for agents), and inquiry messages. All tools act as the authenticated user; Row Level Security enforces per-user data access.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchProperties,
    getProperty,
    listSavedProperties,
    saveProperty,
    unsaveProperty,
    listMyListings,
    listMyMessages,
  ],
});
