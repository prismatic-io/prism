import { z, Cli } from "incur";
import { DeleteCustomerDocument as DELETE_CUSTOMER } from "../../graphql/operations/deleteCustomer.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";

export default Cli.command({
  output: z
    .object({ customerId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete a Customer",
  args: z.object({
    customer: z.string().describe("ID of the customer to delete"),
  }),
  async run(context) {
    const {
      args: { customer },
    } = context;

    await gqlRequest({
      document: DELETE_CUSTOMER,
      variables: {
        id: customer,
      },
    });
    return { customerId: customer, deleted: true as const };
  },
});
