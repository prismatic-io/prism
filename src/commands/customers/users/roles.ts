import { commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

export default defineCommand({
  description: "List Roles you can grant to Customer Users",
  options: {
    ...ux.table.flags(),
  },
  async run(_context: CommandContext) {
    const { flags } = commandInput();

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

    return ux.table(
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
  },
});
