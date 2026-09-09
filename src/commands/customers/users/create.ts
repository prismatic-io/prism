import { CreateCustomerUserDocument as CREATE_CUSTOMER_USER } from "../../../graphql/operations/createCustomerUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import { z, Cli } from "incur";

export default Cli.command({
  output: z.object({ userId: z.string() }).extend(warningsOutput),
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
  options: z.object({
    email: z.string().describe("email address"),
    role: z.string().describe("ID of the role to assign the user"),
    customer: z.string().describe("ID of the customer this user is associated with"),
    name: z.string().optional().describe("name of the new user"),
  }),
  alias: { name: "n", customer: "c", role: "r", email: "e" },
  async run(context) {
    const {
      options: { name, email, role, customer },
    } = context;

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
    if (userId == null)
      return context.error({
        code: "CUSTOMER_USERS_CREATE_FAILED",
        message: "Customer user was not created",
        exitCode: 2,
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

    return {
      userId,
    };
  },
});
