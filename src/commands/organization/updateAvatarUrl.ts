import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { CommitAvatarUploadDocument as COMMIT_AVATAR_UPLOAD } from "../../graphql/operations/commitAvatarUpload.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("organizationId"),
  description: "Update your Organization Avatar URL",
  options: optionsSchema(
    z.object({
      organizationId: z
        .string()
        .describe("ID of an organization")
        .meta({ cli: { name: "organization" } }),
      avatarUrl: z
        .string()
        .optional()
        .describe("Url of the organization avatar")
        .meta({ cli: { char: "n" } }),
    }),
  ),
  async run(context) {
    const {
      options: { organizationId, avatarUrl },
    } = context;

    const result: ResultOf<typeof COMMIT_AVATAR_UPLOAD> = await gqlRequest({
      document: COMMIT_AVATAR_UPLOAD,
      variables: {
        organizationId,
        avatarUrl: avatarUrl ?? commandOutput.error("--avatarUrl is required to update the avatar"),
      },
    });

    return resourceOutput(
      context,
      "organizationId",
      result.updateOrganization?.organization?.id ??
        commandOutput.error("Organization avatar was not updated"),
    );
  },
});
