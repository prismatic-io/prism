import { tableOutputSchema, tableFlags, printTable } from "../../../utils/table.js";
import { ListCustomerRolesDocument as LIST_CUSTOMER_ROLES } from "../../../graphql/operations/listCustomerRoles.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { z, Cli } from "incur";
export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(["id", "name", "description"]),
  description: "List Roles you can grant to Customer Users",
  options: z.object({
    ...tableFlags(),
  }),
  async run(context) {
    const { options: flags } = context;

    const result = await gqlRequest({
      document: LIST_CUSTOMER_ROLES,
    });

    return printTable(
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
