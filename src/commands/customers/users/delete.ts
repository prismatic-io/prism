import { customerFailure } from "../errors.js";
import { nonBlank } from "../schemas.js";
import { z, Cli } from "incur";
import { DeleteUserDocument as DELETE_USER } from "../../../graphql/operations/deleteUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";

export default Cli.command({
  output: z
    .object({ userId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete a Customer User",
  args: z.object({
    user: nonBlank.describe("ID of the user to delete"),
  }),
  async run(context) {
    const {
      args: { user },
    } = context;

    try {
      const result = await gqlRequest({
        document: DELETE_USER,
        variables: {
          id: user,
        },
      });
      if (!result.deleteUser)
        return context.error({
          code: "CUSTOMER_USERS_DELETE_FAILED",
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
        { userId: user, deleted: true },
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
        ...customerFailure(error, "CUSTOMER_USERS_DELETE_FAILED"),
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
