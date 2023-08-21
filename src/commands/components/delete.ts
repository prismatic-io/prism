import { Command, Args } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql";

export default class DeleteCommand extends Command {
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
      document: gql`
        mutation deleteComponent($id: ID!) {
          deleteComponent(input: { id: $id }) {
            component {
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
        id: component,
      },
    });
  }
}
