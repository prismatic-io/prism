import { CreateOrganizationUserDocument as CREATE_ORGANIZATION_USER } from "../../../graphql/operations/createOrganizationUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ userId: z.string() }).extend(warningsOutput),
  description: "Create a User for your Organization",
  examples: [
    { description: "Get the ID of the 'Integrator' role:" },
    {
      description: "Create an organization user and assign the role:",
      options: { email: "foo@email.com", name: "Susan Foo", role: `\${ROLE_ID}` },
    },
  ],
  options: z.object({
    name: z.string().optional().describe("name of the user"),
    email: z.string().describe("email address of the user"),
    role: z.string().describe("role the user should assume"),
  }),
  async run(context) {
    const {
      options: { name, email, role },
    } = context;

    const result = await gqlRequest({
      document: CREATE_ORGANIZATION_USER,
      variables: {
        name,
        email,
        role,
      },
    });
    const requiredValue1 = result.createOrganizationUser?.user?.id;
    if (requiredValue1 == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Organization user was not created",
        exitCode: 2,
      });

    return {
      userId: requiredValue1,
    };
  },
  alias: { role: "r", email: "e", name: "n" },
});
