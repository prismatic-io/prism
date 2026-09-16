import { Cli, z } from "incur";
import dayjs from "dayjs";
import {
  ListComponentsDocument as LIST_COMPONENTS,
  type ListComponentsQuery,
} from "../../graphql/components/listComponents.generated.js";
import { gqlRequest } from "../../graphql.js";
import { requestFailure } from "../../utils/failure.js";
import { collectPages, nextPageCta } from "../../utils/pagination.js";
import { paginationFlags, printTable, tableFlags, tableOutputSchema } from "../../utils/table.js";
import { resolveVisibility, visibilityFilterOptions } from "./schemas.js";

type ComponentNode = ListComponentsQuery["components"]["nodes"][number];

const optional = (value: boolean | undefined) => (value === undefined ? null : value);

export default Cli.command({
  outputPolicy: "agent-only",
  description: "List available Components",
  output: tableOutputSchema(
    [
      "id",
      "key",
      "label",
      "public",
      "description",
      "versionNumber",
      "versionCreatedAt",
      "category",
      "customerId",
      "customerName",
      "customerExternalId",
    ],
    true,
  ),
  examples: [
    { description: "List every component you can use:" },
    {
      description: "Find components whose key or label mentions Salesforce:",
      options: { search: "sales" },
    },
    {
      description: "List private components that provide triggers:",
      options: { private: true, hasTriggers: true },
    },
    {
      description: "List components that provide picklist data sources:",
      options: { dataSourceType: "picklist" },
    },
  ],
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
    ...visibilityFilterOptions(),
    showAllVersions: z
      .boolean()
      .optional()
      .describe(
        "If specified this command returns all versions of all components rather than only the latest version",
      ),
    search: z
      .string()
      .optional()
      .describe("Search components by label first, then by key (case insensitive)"),
    fulltext: z
      .string()
      .optional()
      .describe("Full-text search across component and action labels and descriptions"),
    category: z.string().optional().describe("Only list components in this category"),
    hasActions: z.boolean().optional().describe("Only list components that provide actions"),
    hasTriggers: z.boolean().optional().describe("Only list components that provide triggers"),
    hasDataSources: z
      .boolean()
      .optional()
      .describe("Only list components that provide data sources"),
    dataSourceType: z
      .string()
      .optional()
      .describe(
        "Only list components that provide data sources of this type (for example PICKLIST)",
      ),
    hasConnections: z
      .boolean()
      .optional()
      .describe("Only list components that provide connections"),
  }),
  alias: { search: "s", showAllVersions: "a" },
  async run(context) {
    const { options: flags } = context;
    try {
      const { items, pageInfo } = await collectPages<ComponentNode>(
        async (after) => {
          const { components }: ListComponentsQuery = await gqlRequest({
            document: LIST_COMPONENTS,
            variables: {
              after,
              first: flags.first ?? null,
              allVersions: flags.showAllVersions ?? false,
              filterQuery: flags.search
                ? JSON.stringify(["or", ["in", "key", flags.search], ["in", "label", flags.search]])
                : null,
              search: flags.fulltext ?? null,
              category: flags.category ?? null,
              public: optional(resolveVisibility(flags)),
              hasActions: optional(flags.hasActions),
              hasTriggers: optional(flags.hasTriggers),
              hasDataSources: optional(flags.hasDataSources),
              hasDataSourcesOfType: flags.dataSourceType?.toLowerCase() ?? null,
              hasConnections: optional(flags.hasConnections),
            },
          });
          return components;
        },
        { after: flags.after, all: flags.all === true || !context.agent },
      );

      const result = printTable(
        items,
        {
          id: { minWidth: 8, extended: true },
          key: { minWidth: 10, extended: true },
          label: {},
          public: {},
          description: {},
          versionNumber: { header: "Version" },
          versionCreatedAt: {
            header: "Last Published",
            extended: true,
            get: ({ versionCreatedAt }) => dayjs(versionCreatedAt).format(),
          },
          category: { get: ({ category }) => category || "" },
          customerId: { extended: true, get: ({ customer }) => customer?.id ?? "" },
          customerName: { extended: true, get: ({ customer }) => customer?.name ?? "" },
          customerExternalId: { extended: true, get: ({ customer }) => customer?.externalId ?? "" },
        },
        { ...flags },
      );
      return context.ok(
        { ...result, pageInfo },
        nextPageCta(
          "components list",
          undefined,
          flags,
          pageInfo,
          context.agent,
          "Fetch the next page of components",
        ),
      );
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_LIST_FAILED", true));
    }
  },
});
