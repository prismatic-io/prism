import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { DeleteInstanceDocument as DELETE_INSTANCE } from "../../graphql/operations/deleteInstance.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
  static description = "Delete an Instance";
  static args = {
    instance: Args.string({
      required: true,
      description: "ID of the instance to delete",
    }),
  };

  async run() {
    const {
      args: { instance },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: DELETE_INSTANCE,
      variables: {
        id: instance,
      },
    });
  }
}
