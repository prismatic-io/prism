import { CreateCustomerDocument as CREATE_CUSTOMER } from "../../graphql/operations/createCustomer.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ customerId: z.string() }).extend(warningsOutput),
  description: "Create a new Customer",
  options: z.object({
    name: z.string().describe("short name of the new customer"),
    description: z.string().optional().describe("longer description of the customer"),
    externalId: z.string().optional().describe("external ID of the customer from your system"),
    label: z.array(z.string()).optional().describe("a label to apply to the customer"),
  }),
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

    const result = await gqlRequest({
      document: CREATE_CUSTOMER,
      variables: {
        name,
        description,
        externalId,
        labels: label,
      },
    });

    const resourceId = result.createCustomer?.customer?.id;
    if (resourceId == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Customer was not created",
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
