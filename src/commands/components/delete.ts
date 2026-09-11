import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { DeleteComponentDocument as DELETE_COMPONENT } from "../../graphql/operations/deleteComponent.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete a Component";
  static args = {
    component: Args.string({
      required: true,
      description: "ID of the component to delete",
    }),
  };

  async run() {
    const {
      args: { component },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: DELETE_COMPONENT,
      variables: {
        id: component,
      },
    });
  }
}
