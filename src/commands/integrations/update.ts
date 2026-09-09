import { parseJsonOrUndefined } from "../../fields.js";
import { UpdateIntegrationDocument as UPDATE_INTEGRATION } from "../../graphql/operations/updateIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ integrationId: z.string() }).extend(warningsOutput),
  description: "Update an Integration's name or description",
  args: z.object({
    integration: z.string().describe("ID of an integration"),
  }),
  options: z.object({
    name: z.string().optional().describe("new name to give the integration"),
    description: z.string().optional().describe("new description to give the integration"),
    customer: z
      .string()
      .optional()
      .describe("ID of customer with which to associate the integration"),
    "test-config-vars": z
      .string()
      .optional()
      .describe("JSON-formatted config variables to be used for testing"),
  }),
  async run(context) {
    const {
      args: { integration },
      options: { name, description, customer, "test-config-vars": testConfigVars },
    } = context;
    const result = await gqlRequest({
      document: UPDATE_INTEGRATION,
      variables: {
        id: integration,
        name,
        description,
        customer,
        testConfigVars: parseJsonOrUndefined(testConfigVars),
      },
    });

    const resourceId = result.updateIntegration?.integration?.id;
    if (resourceId == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Integration was not updated",
        exitCode: 2,
      });
    return context.ok(
      { integrationId: resourceId },
      {
        cta: {
          commands: [
            {
              command: "integrations flows list",
              description: "Inspect this integration's flows",
              args: { integration: resourceId },
            },
          ],
        },
      },
    );
  },
  alias: { customer: "c", description: "d", name: "n" },
});
