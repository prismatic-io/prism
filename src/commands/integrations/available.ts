import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../command.js";
import { MarkAvailabilityDocument as MARK_AVAILABILITY } from "../../graphql/operations/markAvailability.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("integrationId"),
  description: "Mark an Integration version as available or unavailable",
  args: argsSchema(
    z.object({
      integration: z.string().describe("ID of an integration version"),
    }),
  ),
  options: optionsSchema(
    z.object({
      available: z
        .boolean()
        .describe("Version is available or unavailable")
        .meta({ cli: { char: "a", allowNo: true } }),
    }),
  ),
  async run(context) {
    const {
      args: { integration },
      options: { available },
    } = context;

    const result: ResultOf<typeof MARK_AVAILABILITY> = await gqlRequest({
      document: MARK_AVAILABILITY,
      variables: {
        id: integration,
        available,
      },
    });

    return resourceOutput(
      context,
      "integrationId",
      result.updateIntegrationVersionAvailability?.integration?.id ??
        commandOutput.error("Integration availability was not updated"),
    );
  },
});
