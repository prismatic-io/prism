import { ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Roles you can grant to Customer Users";

  static flags = {
    ...ux.table.flags(),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result = await gqlRequest({
      document: gql`
        query listCustomerRoles {
          customerRoles {
            id
            name
            description
          }
        }
      `,
    });

    ux.table(
      result.customerRoles,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        description: {},
      },
      { ...flags },
    );
  }
}
