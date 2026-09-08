import { z } from "incur";
import { defineCommand, argsSchema } from "../../command.js";
import { DeleteCustomerDocument as DELETE_CUSTOMER } from "../../graphql/operations/deleteCustomer.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutputSchema, resultOutput } from "../../output.js";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("customerId").extend({ deleted: z.literal(true) }),
  description: "Delete a Customer",
  args: argsSchema(
    z.object({
      customer: z.string().describe("ID of the customer to delete"),
    }),
  ),
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
    return resultOutput(context, { customerId: customer, deleted: true });
  },
});
