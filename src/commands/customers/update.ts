import { UpdateCustomerDocument as UPDATE_CUSTOMER } from "../../graphql/operations/updateCustomer.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ customerId: z.string() }).extend(warningsOutput),
  description: "Update a Customer",
  args: z.object({
    customer: z.string().describe("ID of a customer"),
  }),
  options: z.object({
    name: z.string().optional().describe("name of the customer"),
    description: z.string().optional().describe("description of the customer"),
    externalId: z.string().optional().describe("external ID of the customer from your system"),
    label: z.array(z.string()).optional().describe("a label to apply to the customer"),
  }),
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

    const resourceId = result.updateCustomer?.customer?.id;
    if (resourceId == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Customer was not updated",
        exitCode: 2,
      });
    return context.ok(
      { customerId: resourceId },
      {
        cta: {
          commands: [
            {
              command: "customers users list",
              description: "Inspect this customer's users",
              args: { customer: resourceId },
            },
          ],
        },
      },
    );
  },
  alias: { label: "l", externalId: "e", description: "d", name: "n" },
});
