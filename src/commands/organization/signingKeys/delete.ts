import { z, Cli } from "incur";
import { DeleteOrganizationSigningKeyMutationDocument as DELETE_ORGANIZATION_SIGNING_KEY_MUTATION } from "../../../graphql/operations/DeleteOrganizationSigningKeyMutation.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";

export default Cli.command({
  output: z
    .object({ signingKeyId: z.string() })
    .extend(warningsOutput)
    .extend({ deleted: z.literal(true) }),
  description: "Delete an embedded marketplace signing key",
  args: z.object({
    signingKeyId: z.string().describe("ID of the signing key to delete"),
  }),
  async run(context) {
    const {
      args: { signingKeyId },
    } = context;

    await gqlRequest({
      document: DELETE_ORGANIZATION_SIGNING_KEY_MUTATION,
      variables: {
        id: signingKeyId,
      },
    });
    return { signingKeyId: signingKeyId, deleted: true as const };
  },
});
