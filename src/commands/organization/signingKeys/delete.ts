import { z } from "incur";
import { defineCommand, argsSchema } from "../../../command.js";
import { DeleteOrganizationSigningKeyMutationDocument as DELETE_ORGANIZATION_SIGNING_KEY_MUTATION } from "../../../graphql/operations/DeleteOrganizationSigningKeyMutation.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutputSchema, resultOutput } from "../../../output.js";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("signingKeyId").extend({ deleted: z.literal(true) }),
  description: "Delete an embedded marketplace signing key",
  args: argsSchema(
    z.object({
      signingKeyId: z.string().describe("ID of the signing key to delete"),
    }),
  ),
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
    return resultOutput(context, { signingKeyId: signingKeyId, deleted: true });
  },
});
