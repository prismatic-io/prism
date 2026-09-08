import { z } from "incur";
import { defineCommand, argsSchema } from "../../../command.js";
import { DeleteUserDocument as DELETE_USER } from "../../../graphql/operations/deleteUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutputSchema, resultOutput } from "../../../output.js";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("userId").extend({ deleted: z.literal(true) }),
  description: "Delete a Customer User",
  args: argsSchema(
    z.object({
      user: z.string().describe("ID of the user to delete"),
    }),
  ),
  async run(context) {
    const {
      args: { user },
    } = context;

    await gqlRequest({
      document: DELETE_USER,
      variables: {
        id: user,
      },
    });
    return resultOutput(context, { userId: user, deleted: true });
  },
});
