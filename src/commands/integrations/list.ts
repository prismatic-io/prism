import type { ListIntegrationsQuery } from "../../graphql/integrations/listIntegrations.generated.js";
import { ListIntegrationsDocument as LIST_INTEGRATIONS } from "../../graphql/integrations/listIntegrations.generated.js";
import { gqlRequest } from "../../graphql.js";
import { paginationFlags, tableOutputSchema, tableFlags, printTable } from "../../utils/table.js";
import { z, Cli } from "incur";

type IntegrationNode = ListIntegrationsQuery["integrations"]["nodes"][number];

const isIntegrationNode = (node: IntegrationNode | null): node is IntegrationNode => node !== null;

export default Cli.command({
  outputPolicy: "agent-only",
  description: "List Integrations",
  output: tableOutputSchema(
    [
      "id",
      "name",
      "description",
      "versionNumber",
      "labels",
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
        "If specified this command returns all versions of all integrations rather than only the latest version",
      ),
    customer: z
      .string()
      .optional()
      .describe(
        "If specified this command returns only integrations that are available to the specified customer ID",
      ),
    "org-only": z
      .boolean()
      .optional()
      .describe("If specified this command returns only org integrations"),
    search: z
      .string()
      .optional()
      .describe("If specified, search for integrations by name (case insensitive)."),
  }),
  async run(context) {
    const { options: flags } = context;
    const { showAllVersions, customer, "org-only": orgOnly, search } = flags;

    let integrations: IntegrationNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let pageInfo: ListIntegrationsQuery["integrations"]["pageInfo"] = {
      hasNextPage: false,
      endCursor: null,
    };

    while (hasNextPage) {
      const {
        integrations: { nodes, pageInfo: nextPageInfo },
      }: ListIntegrationsQuery = await gqlRequest({
        document: LIST_INTEGRATIONS,
        variables: {
          showAllVersions,
          after: cursor,
          first: flags.first,
          customer,
          customerIsnull: orgOnly,
          search,
        },
      });
      integrations = [...integrations, ...nodes.filter(isIntegrationNode)];
      pageInfo = nextPageInfo;
      cursor = nextPageInfo.endCursor ?? null;
      hasNextPage = nextPageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = printTable(
      integrations,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        description: {},
        versionNumber: { header: "Version" },
        labels: { extended: true },
        category: { extended: true },
        customerId: { extended: true, get: (row) => row.customer?.id ?? "" },
        customerName: {
          extended: true,
          get: (row) => row.customer?.name ?? "",
        },
        customerExternalId: {
          extended: true,
          get: (row) => row.customer?.externalId ?? "",
        },
      },
      { ...flags },
    );
    return { ...result, pageInfo };
  },
  alias: { search: "s", "org-only": "o", customer: "c", showAllVersions: "a" },
});
