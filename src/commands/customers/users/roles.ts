import { Command, CliUx } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql";

export default class ListCommand extends Command {
  static description = "List Roles you can grant to Customer Users";

  static flags = {
    ...CliUx.ux.table.flags(),
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

    CliUx.ux.table(
      result.customerRoles,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        description: {},
      },
      { ...flags }
    );
  }
}
