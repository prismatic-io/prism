import { Cli, z } from "incur";
import { searchCatalog } from "../../utils/component/catalog.js";
import { requestFailure } from "../../utils/failure.js";
import { printTable, tableFlags, tableOutputSchema } from "../../utils/table.js";
import { visibilityFilterOptions, resolveVisibility } from "./schemas.js";

const kinds = {
  all: undefined,
  components: "component",
  actions: "action",
  triggers: "trigger",
  "data-sources": "dataSource",
} as const;

export default Cli.command({
  outputPolicy: "agent-only",
  description:
    "Search components, actions, triggers, and data sources with the same ranked search the Designer uses",
  output: tableOutputSchema(
    [
      "kind",
      "componentKey",
      "componentLabel",
      "componentVersion",
      "public",
      "key",
      "label",
      "description",
      "category",
      "dataSourceType",
      "id",
    ],
    false,
  ),
  examples: [
    {
      description: "Find anything related to posting Slack messages:",
      args: { terms: "slack message" },
    },
    {
      description: "Find triggers that fire when records change:",
      args: { terms: "new record" },
      options: { kind: "triggers" },
    },
    {
      description: "Find picklist data sources for a config wizard:",
      args: { terms: "select channel" },
      options: { kind: "data-sources" },
    },
  ],
  args: z.object({
    terms: z.string().describe("Search terms matched against component and action metadata"),
  }),
  options: z.object({
    ...tableFlags(),
    kind: z
      .enum(["all", "components", "actions", "triggers", "data-sources"])
      .default("all")
      .describe("Restrict results to one kind of catalog entry"),
    category: z
      .string()
      .optional()
      .describe("Only include components in this category (see 'prism components list')"),
    context: z
      .string()
      .optional()
      .describe("Stable key of a Workflow Context whose availability rules filter the results"),
    ...visibilityFilterOptions(),
  }),
  alias: { kind: "k" },
  async run(context) {
    const { options: flags, args } = context;
    try {
      const rows = await searchCatalog({
        terms: args.terms,
        kind: kinds[flags.kind],
        public: resolveVisibility(flags),
        category: flags.category,
        contextStableKey: flags.context,
      });
      const result = printTable(
        rows,
        {
          kind: {},
          componentKey: { header: "Component" },
          componentLabel: { extended: true },
          componentVersion: { header: "Version", extended: true },
          public: { extended: true },
          key: {},
          label: {},
          description: {},
          category: { extended: true },
          dataSourceType: { extended: true },
          id: { extended: true },
        },
        { ...flags },
      );
      return context.ok(result);
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_SEARCH_FAILED", true));
    }
  },
});
