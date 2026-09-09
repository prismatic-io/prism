import { UpdateOrganizationDocument as UPDATE_ORGANIZATION } from "../../graphql/operations/updateOrganization.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ organizationId: z.string() }).extend(warningsOutput),
  description: "Update your Organization",
  options: z.object({
    name: z.string().optional().describe("name of the organization"),
  }),
  async run(context) {
    const {
      options: { name },
    } = context;

    const result = await gqlRequest({
      document: UPDATE_ORGANIZATION,
      variables: {
        name,
      },
    });
    const requiredValue1 = result.updateOrganization?.organization?.id;
    if (requiredValue1 == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Organization was not updated",
        exitCode: 2,
      });

    return {
      organizationId: requiredValue1,
    };
  },
  alias: { name: "n" },
});
