import { z } from "incur";
export const globalOptions = z.object({
  agent: z.boolean().optional().describe("Force structured output optimized for AI agents"),
  printRequests: z.boolean().optional().describe("Print all GraphQL requests that are issued"),
  profile: z.string().optional().describe("Use a profile"),
  quiet: z.boolean().default(false).describe("Reduce helpful notes and text"),
  readOnly: z.boolean().default(false).describe("Reject commands that can modify remote state"),
  yes: z.boolean().default(false).describe("Approve non-interactive confirmation prompts"),
});

export const environmentOptions = z.object({
  PRISMATIC_URL: z.string().optional().describe("Prismatic stack URL"),
  PRISM_PROFILE: z.string().optional().describe("Authentication profile (overridden by --profile)"),
  PRISM_CONFIG_FILE: z.string().optional().describe("Path to the Prism profile configuration file"),
  PRISM_ACCESS_TOKEN: z
    .string()
    .optional()
    .describe("Access token for non-interactive authentication"),
  PRISM_REFRESH_TOKEN: z
    .string()
    .optional()
    .describe("Refresh token for non-interactive authentication"),
  PRISMATIC_TENANT_ID: z
    .string()
    .optional()
    .describe("Tenant associated with environment credentials"),
  PRISM_AGENT: z.string().optional().describe("Force agent mode when set to true or 1"),
  PRISM_AGENT_MODE: z.string().optional().describe("Force agent mode when set to true or 1"),
  FORCE_AGENT_MODE: z.string().optional().describe("Force agent mode when set to true or 1"),
  PRISM_NO_AGENT: z.string().optional().describe("Force human mode when set to true or 1"),
  PRISM_READ_ONLY: z.string().optional().describe("Reject commands that can modify state"),
  FORCE_HUMAN_MODE: z.string().optional().describe("Force human mode when set to true or 1"),
});
