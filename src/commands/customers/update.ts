import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../command.js";
import { UpdateCustomerDocument as UPDATE_CUSTOMER } from "../../graphql/operations/updateCustomer.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("customerId"),
  description: "Update a Customer",
  args: argsSchema(
    z.object({
      customer: z.string().describe("ID of a customer"),
    }),
  ),
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .optional()
        .describe("name of the customer")
        .meta({ cli: { char: "n" } }),
      description: z
        .string()
        .optional()
        .describe("description of the customer")
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

    const result: ResultOf<typeof UPDATE_CUSTOMER> = await gqlRequest({
      document: UPDATE_CUSTOMER,
      variables: {
        id: customer,
        name,
        description,
        externalId,
        labels: label,
      },
    });

    return resourceOutput(
      context,
      "customerId",
      result.updateCustomer?.customer?.id ?? commandOutput.error("Customer was not updated"),
    );
  },
});
