import { Command, Args } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql.js";

export default class DeleteCommand extends Command {
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
