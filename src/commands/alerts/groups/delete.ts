import { DeleteAlertGroupDocument as DELETE_ALERT_GROUP } from "../../../graphql/operations/deleteAlertGroup.generated.js";
import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete an Alert Group";
  static args = {
    group: Args.string({
      required: true,
      description: "ID of the group to delete",
    }),
  };

  async run() {
    const {
      args: { group },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: DELETE_ALERT_GROUP,
      variables: {
        id: group,
      },
    });
  }
}
