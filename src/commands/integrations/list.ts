import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import {
  ListIntegrationsDocument as LIST_INTEGRATIONS,
  type ListIntegrationsQuery,
} from "../../graphql/integrations/listIntegrations.generated.js";
import { gqlRequest } from "../../graphql.js";
import { ux } from "../../utils/ux.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Integrations";
  static flags = {
    ...ux.table.flags(),
    showAllVersions: Flags.boolean({
      char: "a",
      description:
        "If specified this command returns all versions of all integrations rather than only the latest version",
    }),
    customer: Flags.string({
      char: "c",
      description:
        "If specified this command returns only integrations that are available to the specified customer ID",
    }),
    "org-only": Flags.boolean({
      char: "o",
      description: "If specified this command returns only org integrations",
    }),
    search: Flags.string({
      char: "s",
      description: "If specified, search for integrations by name (case insensitive).",
    }),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);
    const { showAllVersions, customer, "org-only": orgOnly, search } = flags;

    let integrations: IntegrationNode[] = [];
    let hasNextPage = true;
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        integrations: { nodes, pageInfo },
      }: ListIntegrationsQuery = await gqlRequest({
        document: LIST_INTEGRATIONS,
        variables: {
          showAllVersions,
          after: cursor,
          customer,
          customerIsnull: orgOnly,
          search,
        },
      });
      integrations = [...integrations, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
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
  }
}

type IntegrationNode = ListIntegrationsQuery["integrations"]["nodes"][number];
