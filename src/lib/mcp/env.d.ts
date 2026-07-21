// Ambient declaration: MCP tool files are bundled into a Deno edge function
// at build time. TypeScript in the Vite frontend project doesn't know about
// Node/Deno `process.env`, so declare a minimal shape here.
declare const process: {
  env: Record<string, string | undefined>;
};
