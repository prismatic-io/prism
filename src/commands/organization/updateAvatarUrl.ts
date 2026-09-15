import { CommitAvatarUploadDocument as COMMIT_AVATAR_UPLOAD } from "../../graphql/operations/commitAvatarUpload.generated.js";
import { gqlRequest, requireOperationResult } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli } from "incur";
import { ValidationError } from "../../errors.js";

export default Cli.command({
  output: z.object({ organizationId: z.string() }).extend(warningsOutput),
  description: "Update your Organization Avatar URL",
  options: z.object({
    organizationId: z.string().describe("ID of an organization"),
    avatarUrl: z.string().optional().describe("Url of the organization avatar"),
  }),
  async run(context) {
    const {
      options: { organizationId, avatarUrl },
    } = context;
    const requiredValue2 = avatarUrl;
    if (requiredValue2 == null)
      throw new ValidationError({
        message: "--avatarUrl is required to update the avatar",
      });

    const result = await gqlRequest({
      document: COMMIT_AVATAR_UPLOAD,
      variables: {
        organizationId,
        avatarUrl: requiredValue2,
      },
    });
    const requiredValue1 = requireOperationResult(
      result.updateOrganization?.organization?.id,
      "Organization avatar was not updated",
    );

    return {
      organizationId: requiredValue1,
    };
  },
  alias: { avatarUrl: "n" },
});
