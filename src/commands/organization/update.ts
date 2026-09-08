import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { UpdateOrganizationDocument as UPDATE_ORGANIZATION } from "../../graphql/operations/updateOrganization.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("organizationId"),
  description: "Update your Organization",
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .optional()
        .describe("name of the organization")
        .meta({ cli: { char: "n" } }),
    }),
  ),
  async run(context) {
    const {
      options: { name },
    } = context;

    const result: ResultOf<typeof UPDATE_ORGANIZATION> = await gqlRequest({
      document: UPDATE_ORGANIZATION,
      variables: {
        name,
      },
    });

    return resourceOutput(
      context,
      "organizationId",
      result.updateOrganization?.organization?.id ??
        commandOutput.error("Organization was not updated"),
    );
  },
});
