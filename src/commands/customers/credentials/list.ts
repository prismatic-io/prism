import { Flags, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Credentials for a Customer";
  static flags = {
    customer: Flags.string({
      char: "c",
      required: true,
      description: "ID of a customer",
    }),
    ...PrismaticBaseCommand.baseFlags,
    ...ux.table.flags(),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);
    const { customer } = flags;

    const result = await gqlRequest({
      document: gql`
        query listCustomerCredentials($id: ID!) {
          customer(id: $id) {
            credentials {
              nodes {
                id
                label
                authorizationMethod {
                  id
                  label
                }
                readyForUse
              }
            }
          }
        }
      `,
      variables: {
        id: customer,
      },
    });

    if (flags.json) {
      this.logJsonOutput(result.customer.credentials.nodes);
    } else {
      ux.table(
        result.customer.credentials.nodes,
        {
          id: {
            minWidth: 8,
            extended: true,
          },
          label: {},
          authorizationMethod: {
            header: "Authorization Method",
            get: (row: any) => row.authorizationMethod.label,
          },
          readyForUse: {
            header: "Ready for Use",
          },
        },
        { ...flags },
      );
    }
  }
}
