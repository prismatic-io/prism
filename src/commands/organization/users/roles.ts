import { Command, CliUx } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql";

export default class ListCommand extends Command {
  static description =
    "List Roles you can grant to other users in your Organization";

  static flags = {
    ...CliUx.ux.table.flags(),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result = await gqlRequest({
      document: gql`
        query listOrganizationRoles {
          organizationRoles {
            id
            name
            description
          }
        }
      `,
    });

    CliUx.ux.table(
      result.organizationRoles,
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
