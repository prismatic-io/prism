import { commandOutput, defineCommand, optionsSchema } from "../../../command.js";
import { CreateOrganizationUserDocument as CREATE_ORGANIZATION_USER } from "../../../graphql/operations/createOrganizationUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("userId"),
  description: "Create a User for your Organization",
  examples: [
    { description: "Get the ID of the 'Integrator' role:" },
    {
      description: "Create an organization user and assign the role:",
      options: { email: "foo@email.com", name: "Susan Foo", role: `\${ROLE_ID}` },
    },
  ],
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .optional()
        .describe("name of the user")
        .meta({ cli: { char: "n" } }),
      email: z
        .string()
        .describe("email address of the user")
        .meta({ cli: { char: "e" } }),
      role: z
        .string()
        .describe("role the user should assume")
        .meta({ cli: { char: "r" } }),
    }),
  ),
  async run(context) {
    const {
      options: { name, email, role },
    } = context;

    const result: ResultOf<typeof CREATE_ORGANIZATION_USER> = await gqlRequest({
      document: CREATE_ORGANIZATION_USER,
      variables: {
        name,
        email,
        role,
      },
    });

    return resourceOutput(
      context,
      "userId",
      result.createOrganizationUser?.user?.id ??
        commandOutput.error("Organization user was not created"),
    );
  },
});
