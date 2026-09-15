import { Cli, z } from "incur";
import { UpdateCustomerDocument as UPDATE_CUSTOMER } from "../../graphql/operations/updateCustomer.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { customerFailure } from "./errors.js";
import { nonBlank } from "./schemas.js";

export default Cli.command({
  output: z.object({ customerId: nonBlank }).extend(warningsOutput),
  description: "Update a Customer",
  args: z.object({
    customer: nonBlank.describe("ID of a customer"),
  }),
  options: z
    .object({
      name: nonBlank.optional().describe("name of the customer"),
      description: z.string().optional().describe("description of the customer"),
      externalId: z.string().optional().describe("external ID of the customer from your system"),
      label: z.array(nonBlank).optional().describe("a label to apply to the customer"),
    })
    .refine(
      (options) =>
        options.name !== undefined ||
        options.description !== undefined ||
        options.externalId !== undefined ||
        options.label !== undefined,
      {
        message: "Provide at least one field to update",
      },
    ),
  alias: { label: "l", externalId: "e", description: "d", name: "n" },
  examples: [
    {
      description:
        "Apply multiple labels to a customer (note: previously set labels will be overwritten)",
      args: { customer: "Q3VzdG9tZXI6MmUzZDllOTUtMWIyMy00N2FjLTk3MjUtMzU1OTA2YzgyZWZj" },
      options: { label: ["Prod Customers", "Beta Testers"] },
    },
  ],
  async run(context) {
    const {
      args: { customer },
      options: { name, description, externalId, label },
    } = context;

    try {
      const result = await gqlRequest({
        document: UPDATE_CUSTOMER,
        variables: {
          id: customer,
          name,
          description,
          externalId,
          labels: label,
        },
      });

      const customerId = result.updateCustomer?.customer?.id;
      if (!customerId)
        return context.error({
          code: "CUSTOMER_UPDATE_FAILED",
          message: "Customer was not updated",
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
        ...customerFailure(error, "CUSTOMER_UPDATE_FAILED"),
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
