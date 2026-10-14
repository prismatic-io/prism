import { Cli, z } from "incur";
import { ListOrganizationRolesDocument as LIST_ORGANIZATION_ROLES } from "../../../graphql/operations/listOrganizationRoles.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { printTable, tableFlags, tableOutputSchema } from "../../../utils/table.js";
export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "description"]),
  description: "List Roles you can grant to other users in your Organization",
  options: z.object({
    ...tableFlags(),
  }),
  async run(context) {
    const { options: flags } = context;

    const result = await gqlRequest({
      document: LIST_ORGANIZATION_ROLES,
    });

    return printTable(
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
  },
});
