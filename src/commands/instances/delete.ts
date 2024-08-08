import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";

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
      document: gql`
        mutation deleteInstance($id: ID!) {
          deleteInstance(input: { id: $id }) {
            instance {
              id
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        id: instance,
      },
    });
  }
}
