import { Cli, z } from "incur";
import { ListCustomerRolesDocument as LIST_CUSTOMER_ROLES } from "../../../graphql/operations/listCustomerRoles.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { printTable, tableFlags } from "../../../utils/table.js";
import { customerFailure } from "../errors.js";
import { customerRoleRowSchema } from "../schemas.js";
export default Cli.command({
  outputPolicy: "agent-only",
  output: z.object({ items: z.array(customerRoleRowSchema) }),
  description: "List Roles you can grant to Customer Users",
  options: z.object({
    ...tableFlags(),
  }),
  async run(context) {
    const { options: flags } = context;

    try {
      const result = await gqlRequest({
        document: LIST_CUSTOMER_ROLES,
      });

      return printTable(
        result.customerRoles.filter((role) => role !== null),
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
    } catch (error) {
      return context.error(customerFailure(error, "CUSTOMER_ROLES_LIST_FAILED", true));
    }
  },
});
