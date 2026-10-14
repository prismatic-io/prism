import { z } from "incur";
import { commandGlobals, writeCommandStatus } from "../../command.js";
import { FilterOperator } from "../../graphql/schema.generated.js";
import type { SearchEngine } from "../../utils/search/engine.js";
import { type Condition, optionalConditions, parseWhere } from "../../utils/search/filters.js";

export const windowOptions = (defaultSince: string) => ({
  since: z
    .string()
    .optional()
    .describe(
      `Start of the time window as a relative duration (15m, 2h, 7d) or ISO timestamp (default ${defaultSince} ago)`,
    ),
  until: z
    .string()
    .optional()
    .describe("End of the time window as a relative duration or ISO timestamp (default now)"),
});

export const whereOption = (subject: string) => ({
  where: z
    .array(z.string())
    .optional()
    .describe(
      `Filter ${subject} with key=value, key!=value, key~text, key^=prefix, key>=value, key<=value, key=null, or 'key in a,b'. Repeatable.`,
    ),
});

export const scopeOptions = () => ({
  instance: z.string().optional().describe("Only include this instance ID"),
  customer: z.string().optional().describe("Only include this customer ID"),
  integration: z.string().optional().describe("Only include this integration ID"),
  flow: z.string().optional().describe("Only include this flow ID"),
});

export const includeTestsOption = () => ({
  includeTests: z
    .boolean()
    .optional()
    .describe("Include test executions, which are hidden by default"),
});

export const directionOption = (defaultDirection: "asc" | "desc") => ({
  direction: z
    .enum(["asc", "desc"])
    .default(defaultDirection)
    .describe("Order results by time, oldest first (asc) or newest first (desc)"),
});

type ScopeFlags = { instance?: string; customer?: string; integration?: string; flow?: string };

export const scopeConditions = (flags: ScopeFlags): Condition[] =>
  optionalConditions([
    ["instanceId", FilterOperator.Eq, flags.instance],
    ["customerId", FilterOperator.Eq, flags.customer],
    ["integrationId", FilterOperator.Eq, flags.integration],
    ["flowId", FilterOperator.Eq, flags.flow],
  ]);

export const whereConditions = (where: string[] | undefined): Condition[] =>
  (where ?? []).map(parseWhere);

export const noteEngine = (engine: SearchEngine, agent: boolean) => {
  if (agent || engine === "search" || commandGlobals().quiet) return;
  writeCommandStatus(
    "Using the legacy search API because this stack does not have the search API. Filters, sorting, and time windows are limited.",
  );
};
