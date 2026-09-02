import { arg, commandInput, defineCommand, option, type CommandContext } from "../../command.js";
import { getPrismMetadata } from "../../utils/integration/metadata.js";
import { setGlobalDebugOnSystemInstance } from "../../utils/integration/mutate.js";
import { ux } from "../../utils/ux.js";

const MISSING_ID_ERROR = "You must provide an integration-id (-i).";

export default defineCommand({
  description: "Set debug mode on or off for an integration's test instance.",
  args: {
    debug: arg.boolean({
      description:
        "Boolean value to set whether globalDebug should be enabled for the given integration",
      required: true,
    }),
  },
  options: {
    "integration-id": option.string({
      char: "i",
      description: "ID of the integration containing the flow to test.",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { debug },
      flags: { "integration-id": integrationIdFlag },
    } = commandInput();

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
  },
});
