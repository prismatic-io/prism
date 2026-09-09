import { customerFailure } from "../errors.js";
import { nonBlank } from "../schemas.js";
import { CreateCustomerUserDocument as CREATE_CUSTOMER_USER } from "../../../graphql/operations/createCustomerUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import { z, Cli } from "incur";

export default Cli.command({
  output: z.object({ userId: nonBlank }).extend(warningsOutput),
  description: "Create a User for the specified Customer",
  hint: "Use customers list and customers users roles to find the customer and role IDs.",
  examples: [
    {
      description: "Add a new 'Member' user for the customer:",
      options: {
        email: "bar@email.com",
        name: "Thomas Bar",
        customer: "CUSTOMER_ID",
        role: "ROLE_ID",
      },
    },
  ],
  options: z.object({
    email: z.email().describe("email address"),
    role: nonBlank.describe("ID of the role to assign the user"),
    customer: nonBlank.describe("ID of the customer this user is associated with"),
    name: nonBlank.optional().describe("name of the new user"),
  }),
  alias: { name: "n", customer: "c", role: "r", email: "e" },
  async run(context) {
    const {
      options: { name, email, role, customer },
    } = context;

    try {
      const result = await gqlRequest({
        document: CREATE_CUSTOMER_USER,
        variables: {
          name,
          email,
          role,
          customer,
        },
      });
      const userId = result.createCustomerUser?.user?.id;
      if (!userId)
        return context.error({
          code: "CUSTOMER_USERS_CREATE_FAILED",
          message: "Customer user was not created",
          exitCode: 1,
          retryable: false,
          cta: {
            commands: [
              {
                command: "customers users list",
                args: { customer },
                description: "Inspect this customer's users before retrying",
              },
              { command: "customers users roles", description: "Check available roles" },
            ],
          },
        });

      return context.ok(
        { userId },
        {
          cta: {
            commands: [
              {
                command: "customers users list",
                args: { customer },
                description: "Inspect this customer's users",
              },
            ],
          },
        },
      );
    } catch (error) {
      return context.error({
        ...customerFailure(error, "CUSTOMER_USERS_CREATE_FAILED"),
        cta: {
          commands: [
            {
              command: "customers users list",
              args: { customer },
              description: "Inspect this customer's users before retrying",
            },
            { command: "customers users roles", description: "Check available roles" },
          ],
        },
      });
    }
  },
});
