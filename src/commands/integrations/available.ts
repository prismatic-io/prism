import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { MarkAvailabilityDocument as MARK_AVAILABILITY } from "../../graphql/operations/markAvailability.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class AvailableCommand extends PrismaticBaseCommand {
  static description = "Mark an Integration version as available or unavailable";
  static args = {
    integration: Args.string({
      required: true,
      description: "ID of an integration version",
    }),
  };
  static flags = {
    available: Flags.boolean({
      required: true,
      char: "a",
      description: "Version is available or unavailable",
      allowNo: true,
    }),
  };

  async run() {
    const {
      args: { integration },
      flags: { available },
    } = await this.parse(AvailableCommand);

    const result = await gqlRequest({
      document: MARK_AVAILABILITY,
      variables: {
        id: integration,
        available,
      },
    });

    const integrationId = result.updateIntegrationVersionAvailability?.integration?.id;
    if (integrationId == null) {
      this.error("The operation returned no resource");
    }

    this.log(integrationId);
  }
}
