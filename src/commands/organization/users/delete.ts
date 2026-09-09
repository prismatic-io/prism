import { z, Cli } from "incur";
import { DeleteUserDocument as DELETE_USER } from "../../../graphql/operations/deleteUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";

export default Cli.command({
  output: z
    .object({ userId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete an Organization User",
  args: z.object({
    user: z.string().describe("ID of the user to delete"),
  }),
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
    return { userId: user, deleted: true as const };
  },
});
