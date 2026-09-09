import { ListComponentsDocument as LIST_COMPONENTS } from "../../graphql/operations/listComponents.generated.js";
import type { ListComponentsQuery } from "../../graphql/operations/listComponents.generated.js";
import dayjs from "dayjs";
import { gqlRequest } from "../../graphql.js";
import { paginationFlags, tableOutputSchema, tableFlags, printTable } from "../../utils/table.js";
import { z, Cli } from "incur";

type ComponentNode = ListComponentsQuery["components"]["nodes"][number];

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
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
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
  }),
  async run(context) {
    const { options: flags } = context;
    const { showAllVersions, search } = flags;

    const { components, pageInfo } = await fetchComponents(
      showAllVersions ?? false,
      search,
      flags.after,
      flags.first,
      flags.all === true || !context.agent,
    );

    const result = printTable(
      components,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        key: {
          minWidth: 10,
          extended: true,
        },
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
        customerId: {
          extended: true,
          get: ({ customer }) => customer?.id ?? "",
        },
        customerName: {
          extended: true,
          get: ({ customer }) => customer?.name ?? "",
        },
        customerExternalId: {
          extended: true,
          get: ({ customer }) => customer?.externalId ?? "",
        },
      },
      { ...flags },
    );
    return { ...result, pageInfo };
  },
  alias: { search: "s", showAllVersions: "a" },
});

const fetchComponents = async (
  showAllVersions: boolean,
  search?: string,
  after?: string,
  first?: number,
  fetchAll = true,
): Promise<{
  components: ComponentNode[];
  pageInfo: { hasNextPage: boolean; endCursor?: string | null };
}> => {
  let components: ComponentNode[] = [];
  let hasNextPage = true;
  let cursor: string | null = after ?? "";
  let finalPageInfo: { hasNextPage: boolean; endCursor?: string | null } = {
    hasNextPage: false,
    endCursor: null,
  };

  while (hasNextPage) {
    const response: ListComponentsQuery = await gqlRequest({
      document: LIST_COMPONENTS,
      variables: {
        showAllVersions,
        after: cursor,
        first,
        filterQuery: search
          ? JSON.stringify(["or", ["in", "key", search], ["in", "label", search]])
          : undefined,
      },
    });
    const { nodes, pageInfo: nextPageInfo } = response.components;
    components = [...components, ...nodes];
    finalPageInfo = nextPageInfo;
    cursor = nextPageInfo.endCursor;
    hasNextPage = nextPageInfo.hasNextPage && fetchAll;
  }
  return { components, pageInfo: finalPageInfo };
};
