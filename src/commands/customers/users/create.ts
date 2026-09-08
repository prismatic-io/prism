import { commandOutput, defineCommand, optionsSchema } from "../../../command.js";
import { CreateCustomerUserDocument as CREATE_CUSTOMER_USER } from "../../../graphql/operations/createCustomerUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("userId"),
  description: "Create a User for the specified Customer",
  examples: [
    { description: "Get the ID of a customer named 'My First Customer':" },
    { description: "Get the ID of the 'Member' role:" },
    {
      description: "Add a new 'Member' user for the customer:",
      options: {
        email: "bar@email.com",
        name: "Thomas Bar",
        customer: `\${CUSTOMER_ID}`,
        role: `\${ROLE_ID}`,
      },
    },
  ],
  options: optionsSchema(
    z.object({
      email: z
        .string()
        .describe("email address")
        .meta({ cli: { char: "e" } }),
      role: z
        .string()
        .describe("ID of the role to assign the user")
        .meta({ cli: { char: "r" } }),
      customer: z
        .string()
        .describe("ID of the customer this user is associated with")
        .meta({ cli: { char: "c" } }),
      name: z
        .string()
        .optional()
        .describe("name of the new user")
        .meta({ cli: { char: "n" } }),
    }),
  ),
  async run(context) {
    const {
      options: { name, email, role, customer },
    } = context;

    const result: ResultOf<typeof CREATE_CUSTOMER_USER> = await gqlRequest({
      document: CREATE_CUSTOMER_USER,
      variables: {
        name,
        email,
        role,
        customer,
      },
    });

    return resourceOutput(
      context,
      "userId",
      result.createCustomerUser?.user?.id ?? commandOutput.error("Customer user was not created"),
    );
  },
});
