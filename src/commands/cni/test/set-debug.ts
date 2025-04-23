import { Args, Flags, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { getPrismMetadata } from "../../../utils/integration/metadata.js";
import { setGlobalDebugOnSystemInstance } from "../../../utils/integration/mutate.js";

const MISSING_ID_ERROR = "You must provide an integration-id (-i).";

export default class CniSetDebugCommand extends PrismaticBaseCommand {
  static description = "Set debug mode on or off for an integration's test instance.";

  static args = {
    debug: Args.boolean({
      description:
        "Boolean value to set whether globalDebug should be enabled for the given integration",
      required: true,
    }),
  };

  static flags = {
    "integration-id": Flags.string({
      char: "i",
      description: "ID of the integration containing the flow to test.",
    }),
  };

  async run() {
    const {
      args: { debug },
      flags: { "integration-id": integrationIdFlag },
    } = await this.parse(CniSetDebugCommand);

    let integrationId = integrationIdFlag;

    // Try to find an integrationId if we were not provided with an ID or invocation URL.
    if (!integrationId) {
      try {
        const metadata = await getPrismMetadata();
        integrationId = metadata.integrationId;
      } catch (e) {
        throw MISSING_ID_ERROR;
      }

      if (!integrationId) throw MISSING_ID_ERROR;
    }

    ux.action.start("Updating globalDebug setting on test instance...");
    await setGlobalDebugOnSystemInstance(integrationId, debug);
    ux.action.stop();
  }
}
