import { DeleteUserDocument as DELETE_USER } from "../../../graphql/operations/deleteUser.generated.js";
import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete an Organization User";
  static args = {
    user: Args.string({
      required: true,
      description: "ID of the user to delete",
    }),
  };

  async run() {
    const {
      args: { user },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: DELETE_USER,
      variables: {
        id: user,
      },
    });
  }
}
