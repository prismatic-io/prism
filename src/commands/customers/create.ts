import { Cli, z } from "incur";
import { CreateCustomerDocument as CREATE_CUSTOMER } from "../../graphql/operations/createCustomer.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { requestFailure } from "../../utils/failure.js";
import { nonBlank } from "./schemas.js";

export default Cli.command({
  output: z.object({ customerId: nonBlank }).extend(warningsOutput),
  description: "Create a new Customer",
  options: z.object({
    name: nonBlank.describe("short name of the new customer"),
    description: z.string().optional().describe("longer description of the customer"),
    externalId: z.string().optional().describe("external ID of the customer from your system"),
    label: z.array(nonBlank).optional().describe("a label to apply to the customer"),
  }),
  alias: { label: "l", externalId: "e", description: "d", name: "n" },
  examples: [
    {
      description: "Apply multiple labels to a customer",
      options: {
        name: "Widgets Inc",
        externalId: "abc-123",
        label: ["Prod Customers", "Beta Testers"],
      },
    },
  ],
  async run(context) {
    const {
      options: { name, description, externalId, label },
    } = context;

    try {
      const result = await gqlRequest({
        document: CREATE_CUSTOMER,
        variables: {
          name,
          description,
          externalId,
          labels: label,
        },
      });

      const customerId = result.createCustomer?.customer?.id;
      if (!customerId)
        return context.error({
          code: "CUSTOMER_CREATE_FAILED",
          message: "Customer was not created",
          exitCode: 1,
          retryable: false,
          cta: {
            commands: [
              {
                command: "customers list",
                description: "Inspect customers before retrying this change",
              },
            ],
          },
        });
      return context.ok(
        { customerId },
        {
          cta: {
            commands: [
              {
                command: "customers users list",
                description: "Inspect this customer's users",
                args: { customer: customerId },
              },
            ],
          },
        },
      );
    } catch (error) {
      return context.error({
        ...requestFailure(error, "CUSTOMER_CREATE_FAILED"),
        cta: {
          commands: [
            {
              command: "customers list",
              description: "Inspect customers before retrying this change",
            },
          ],
        },
      });
    }
  },
});
