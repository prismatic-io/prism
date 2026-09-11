import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { DeleteIntegrationDocument as DELETE_INTEGRATION } from "../../graphql/operations/deleteIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete an Integration";
  static args = {
    integration: Args.string({
      required: true,
      description: "ID of the integration to delete",
    }),
  };

  async run() {
    const {
      args: { integration },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: DELETE_INTEGRATION,
      variables: {
        id: integration,
      },
    });
  }
}
