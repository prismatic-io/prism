import { ForkIntegrationDocument as FORK_INTEGRATION } from "../../graphql/operations/forkIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ integrationId: z.string() }).extend(warningsOutput),
  description: "Fork an Integration",
  options: z.object({
    name: z.string().describe("name of the forked integration"),
    description: z.string().describe("longer description of the forked integration"),
  }),
  args: z.object({
    parent: z.string().describe("ID of the Integration to fork"),
  }),
  async run(context) {
    const {
      options: { name, description },
      args: { parent },
    } = context;

    const result = await gqlRequest({
      document: FORK_INTEGRATION,
      variables: {
        parentID: parent,
        name,
        description,
      },
    });

    const resourceId = result.forkIntegration?.integration?.id;
    if (resourceId == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Integration was not forked",
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
  alias: { description: "d", name: "n" },
});
