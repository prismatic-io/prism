import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { CreateCustomerDocument as CREATE_CUSTOMER } from "../../graphql/operations/createCustomer.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("customerId"),
  description: "Create a new Customer",
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .describe("short name of the new customer")
        .meta({ cli: { char: "n" } }),
      description: z
        .string()
        .optional()
        .describe("longer description of the customer")
        .meta({ cli: { char: "d" } }),
      externalId: z
        .string()
        .optional()
        .describe("external ID of the customer from your system")
        .meta({ cli: { char: "e" } }),
      label: z
        .array(z.string())
        .optional()
        .describe("a label to apply to the customer")
        .meta({ cli: { char: "l" } }),
    }),
  ),
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

    const result: ResultOf<typeof CREATE_CUSTOMER> = await gqlRequest({
      document: CREATE_CUSTOMER,
      variables: {
        name,
        description,
        externalId,
        labels: label,
      },
    });

    return resourceOutput(
      context,
      "customerId",
      result.createCustomer?.customer?.id ?? commandOutput.error("Customer was not created"),
    );
  },
});
