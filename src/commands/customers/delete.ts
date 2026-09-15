import { Cli, z } from "incur";
import { DeleteCustomerDocument as DELETE_CUSTOMER } from "../../graphql/operations/deleteCustomer.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { customerFailure } from "./errors.js";
import { nonBlank } from "./schemas.js";

export default Cli.command({
  output: z
    .object({ customerId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete a Customer",
  args: z.object({
    customer: nonBlank.describe("ID of the customer to delete"),
  }),
  async run(context) {
    const {
      args: { customer },
    } = context;

    try {
      const result = await gqlRequest({
        document: DELETE_CUSTOMER,
        variables: {
          id: customer,
        },
      });
      if (!result.deleteCustomer)
        return context.error({
          code: "CUSTOMER_DELETE_FAILED",
          message: "The API did not confirm deletion.",
          exitCode: 1,
          retryable: false,
          cta: {
            commands: [
              {
                command: "customers list",
                description: "Inspect customers before retrying deletion",
              },
            ],
          },
        });
      return context.ok(
        { customerId: customer, deleted: true },
        {
          cta: {
            commands: [
              {
                command: "customers list",
                description: "Inspect remaining customers",
              },
            ],
          },
        },
      );
    } catch (error) {
      return context.error({
        ...customerFailure(error, "CUSTOMER_DELETE_FAILED"),
        cta: {
          commands: [
            {
              command: "customers list",
              description: "Inspect customers before retrying deletion",
            },
          ],
        },
      });
    }
  },
});
