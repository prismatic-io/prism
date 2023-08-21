import { Command, Flags, ux } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql";

export default class ListCommand extends Command {
  static description = "List Instances";
  static flags = {
    customer: Flags.string({
      char: "c",
      required: false,
      description: "ID of a customer",
    }),
    integration: Flags.string({
      char: "i",
      required: false,
      description: "ID of an integration",
    }),
    ...ux.table.flags(),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);
    const { customer, integration } = flags;

    let instances: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        instances: { nodes, pageInfo },
      } = await gqlRequest({
        document: gql`
          query listInstances($customer: ID, $integration: ID, $after: String) {
            instances(
              customer: $customer
              integration: $integration
              isSystem: false
              after: $after
            ) {
              nodes {
                id
                name
                description
                enabled
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
          customer,
          integration,
          after: cursor,
        },
      });
      instances = [...instances, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    ux.table(
      instances,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        customer: {
          get: ({ customer }) => customer.name,
        },
        customerid: {
          get: ({ customer }) => customer.id,
          extended: true,
        },
        customerExternalId: {
          get: ({ customer }) => customer.externalId || "",
          extended: true,
        },
        description: {},
        enabled: { extended: true },
      },
      { ...flags }
    );
  }
}
