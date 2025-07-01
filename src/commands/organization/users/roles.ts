import { ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Roles you can grant to other users in your Organization";

  static flags = {
    ...PrismaticBaseCommand.baseFlags,
    ...ux.table.flags(),
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

    if (flags.json) {
      this.log(JSON.stringify(result.organizationRoles, null, 2));
    } else {
      ux.table(
        result.organizationRoles,
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
}
