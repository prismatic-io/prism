import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../command.js";
import { parseJsonOrUndefined } from "../../fields.js";
import { UpdateIntegrationDocument as UPDATE_INTEGRATION } from "../../graphql/operations/updateIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("integrationId"),
  description: "Update an Integration's name or description",
  args: argsSchema(
    z.object({
      integration: z.string().describe("ID of an integration"),
    }),
  ),
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .optional()
        .describe("new name to give the integration")
        .meta({ cli: { char: "n" } }),
      description: z
        .string()
        .optional()
        .describe("new description to give the integration")
        .meta({ cli: { char: "d" } }),
      customer: z
        .string()
        .optional()
        .describe("ID of customer with which to associate the integration")
        .meta({ cli: { char: "c" } }),
      "test-config-vars": z
        .string()
        .optional()
        .describe("JSON-formatted config variables to be used for testing"),
    }),
  ),
  async run(context) {
    const {
      args: { integration },
      options: { name, description, customer, "test-config-vars": testConfigVars },
    } = context;
    const result: ResultOf<typeof UPDATE_INTEGRATION> = await gqlRequest({
      document: UPDATE_INTEGRATION,
      variables: {
        id: integration,
        name,
        description,
        customer,
        testConfigVars: parseJsonOrUndefined(testConfigVars),
      },
    });

    return resourceOutput(
      context,
      "integrationId",
      result.updateIntegration?.integration?.id ??
        commandOutput.error("Integration was not updated"),
    );
  },
});
