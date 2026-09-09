import { CommitAvatarUploadDocument as COMMIT_AVATAR_UPLOAD } from "../../graphql/operations/commitAvatarUpload.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
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
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "--avatarUrl is required to update the avatar",
        exitCode: 2,
      });

    const result = await gqlRequest({
      document: COMMIT_AVATAR_UPLOAD,
      variables: {
        organizationId,
        avatarUrl: requiredValue2,
      },
    });
    const requiredValue1 = result.updateOrganization?.organization?.id;
    if (requiredValue1 == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Organization avatar was not updated",
        exitCode: 2,
      });

    return {
      organizationId: requiredValue1,
    };
  },
  alias: { avatarUrl: "n" },
});
