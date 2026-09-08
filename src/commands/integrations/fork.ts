import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../command.js";
import { ForkIntegrationDocument as FORK_INTEGRATION } from "../../graphql/operations/forkIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("integrationId"),
  description: "Fork an Integration",
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .describe("name of the forked integration")
        .meta({ cli: { char: "n" } }),
      description: z
        .string()
        .describe("longer description of the forked integration")
        .meta({ cli: { char: "d" } }),
    }),
  ),
  args: argsSchema(
    z.object({
      parent: z.string().describe("ID of the Integration to fork"),
    }),
  ),
  async run(context) {
    const {
      options: { name, description },
      args: { parent },
    } = context;

    const result: ResultOf<typeof FORK_INTEGRATION> = await gqlRequest({
      document: FORK_INTEGRATION,
      variables: {
        parentID: parent,
        name,
        description,
      },
    });

    return resourceOutput(
      context,
      "integrationId",
      result.forkIntegration?.integration?.id ?? commandOutput.error("Integration was not forked"),
    );
  },
});
