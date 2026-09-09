import { z, Cli } from "incur";
import { warningsOutput } from "../../output.js";
import { getPrismMetadata } from "../../utils/integration/metadata.js";
import { setGlobalDebugOnSystemInstance } from "../../utils/integration/mutate.js";
import { startAction, stopAction } from "../../utils/progress.js";

const MISSING_ID_ERROR = "You must provide an integration-id (-i).";

export default Cli.command({
  output: z
    .object({ integrationId: z.string() })
    .extend(warningsOutput)
    .extend({ debug: z.boolean() }),
  description: "Set debug mode on or off for an integration's test instance.",
  args: z.object({
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
  options: z.object({
    "integration-id": z
      .string()
      .optional()
      .describe("ID of the integration containing the flow to test."),
  }),
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

    startAction("Updating globalDebug setting on test instance...");
    await setGlobalDebugOnSystemInstance(integrationId, debug);
    stopAction();
    return { integrationId, debug };
  },
  alias: { "integration-id": "i" },
});
