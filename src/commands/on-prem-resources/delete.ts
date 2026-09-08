import { DeleteOnPremiseResourceDocument as DELETE_ON_PREMISE_RESOURCE } from "../../graphql/operations/deleteOnPremiseResource.generated.js";
import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gqlRequest } from "../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete an On-Premise Resource";
  static args = {
    resource: Args.string({
      required: true,
      description: "ID of the On-Premise Resource to delete",
    }),
  };

  async run() {
    const {
      args: { resource },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: DELETE_ON_PREMISE_RESOURCE,
      variables: {
        id: resource,
      },
    });
  }
}
