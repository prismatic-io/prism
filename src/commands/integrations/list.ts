import { Flags, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Integrations";
  static flags = {
    ...PrismaticBaseCommand.baseFlags,
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
  };

  async run() {
    const { flags } = await this.parse(ListCommand);
    const { showAllVersions, customer, "org-only": orgOnly } = flags;

    let integrations: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        integrations: { nodes, pageInfo },
      } = await gqlRequest({
        document: gql`
          query listIntegrations(
            $showAllVersions: Boolean
            $after: String
            $customer: ID
            $customerIsnull: Boolean
          ) {
            integrations(
              allVersions: $showAllVersions
              after: $after
              customer: $customer
              customer_Isnull: $customerIsnull
            ) {
              nodes {
                id
                name
                description
                versionNumber
                labels
                category
                customer {
                  id
                  name
                  externalId
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
        variables: {
          showAllVersions,
          after: cursor,
          customer,
          customerIsnull: orgOnly,
        },
      });
      integrations = [...integrations, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    if (flags.json) {
      this.logJsonOutput(integrations);
    } else {
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
}
