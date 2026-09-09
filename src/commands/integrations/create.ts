import { CreateIntegrationDocument as CREATE_INTEGRATION } from "../../graphql/operations/createIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ integrationId: z.string() }).extend(warningsOutput),
  description: "Create an Integration",
  options: z.object({
    name: z.string().describe("name of the integration to create"),
    description: z.string().describe("longer description of the integration"),
    customer: z
      .string()
      .optional()
      .describe("ID of customer with which to associate the integration"),
  }),
  async run(context) {
    const {
      options: { name, description, customer },
    } = context;

    const result = await gqlRequest({
      document: CREATE_INTEGRATION,
      variables: {
        name,
        description,
        customer,
      },
    });

    const resourceId = result.createIntegration?.integration?.id;
    if (resourceId == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Integration was not created",
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
