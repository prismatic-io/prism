import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { CreateIntegrationDocument as CREATE_INTEGRATION } from "../../graphql/operations/createIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("integrationId"),
  description: "Create an Integration",
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .describe("name of the integration to create")
        .meta({ cli: { char: "n" } }),
      description: z
        .string()
        .describe("longer description of the integration")
        .meta({ cli: { char: "d" } }),
      customer: z
        .string()
        .optional()
        .describe("ID of customer with which to associate the integration")
        .meta({ cli: { char: "c" } }),
    }),
  ),
  async run(context) {
    const {
      options: { name, description, customer },
    } = context;

    const result: ResultOf<typeof CREATE_INTEGRATION> = await gqlRequest({
      document: CREATE_INTEGRATION,
      variables: {
        name,
        description,
        customer,
      },
    });

    return resourceOutput(
      context,
      "integrationId",
      result.createIntegration?.integration?.id ??
        commandOutput.error("Integration was not created"),
    );
  },
});
