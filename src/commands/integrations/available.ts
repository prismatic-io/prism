import type { ResultOf } from "@graphql-typed-document-node/core";
import { MarkAvailabilityDocument as MARK_AVAILABILITY } from "../../graphql/operations/markAvailability.generated.js";
import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
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

    const result: ResultOf<typeof MARK_AVAILABILITY> = await gqlRequest({
      document: MARK_AVAILABILITY,
      variables: {
        id: integration,
        available,
      },
    });

    this.log(
      result.updateIntegrationVersionAvailability?.integration?.id ??
        this.error("Integration availability was not updated"),
    );
  }
}
