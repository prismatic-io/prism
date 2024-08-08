import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gqlRequest, gql } from "../../graphql.js";

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
