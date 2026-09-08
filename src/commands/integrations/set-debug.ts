import { z } from "incur";
import { defineCommand, argsSchema, optionsSchema } from "../../command.js";
import { resourceOutputSchema, resultOutput } from "../../output.js";
import { getPrismMetadata } from "../../utils/integration/metadata.js";
import { setGlobalDebugOnSystemInstance } from "../../utils/integration/mutate.js";
import { ux } from "../../utils/ux.js";

const MISSING_ID_ERROR = "You must provide an integration-id (-i).";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("integrationId").extend({ debug: z.boolean() }),
  description: "Set debug mode on or off for an integration's test instance.",
  args: argsSchema(
    z.object({
      debug: z
        .preprocess(
          (value) =>
            typeof value === "string"
              ? !["0", "false", "n", "no"].includes(value.toLowerCase())
              : value,
          z.boolean(),
        )
        .describe(
          "Boolean value to set whether globalDebug should be enabled for the given integration",
        )
        .meta({ cli: { kind: "boolean" } }),
    }),
  ),
  options: optionsSchema(
    z.object({
      "integration-id": z
        .string()
        .optional()
        .describe("ID of the integration containing the flow to test.")
        .meta({ cli: { char: "i" } }),
    }),
  ),
  async run(context) {
    const {
      args: { debug },
      options: { "integration-id": integrationIdFlag },
    } = context;

    let integrationId = integrationIdFlag;

    // Try to find an integrationId if we were not provided with an ID or invocation URL.
    if (!integrationId) {
      try {
        const metadata = await getPrismMetadata();
        integrationId = metadata.integrationId;
      } catch (_e) {
        throw MISSING_ID_ERROR;
      }

      if (!integrationId) throw MISSING_ID_ERROR;
    }

    ux.action.start("Updating globalDebug setting on test instance...");
    await setGlobalDebugOnSystemInstance(integrationId, debug);
    ux.action.stop();
    return resultOutput(context, { integrationId, debug });
  },
});
