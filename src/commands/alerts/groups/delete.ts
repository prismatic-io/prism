import { Command } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql";

export default class DeleteCommand extends Command {
  static description = "Delete an Alert Group";
  static args = [
    {
      name: "group",
      required: true,
      description: "ID of the group to delete",
    },
  ];

  async run() {
    const {
      args: { group },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: gql`
        mutation deleteAlertGroup($id: ID!) {
          deleteAlertGroup(input: { id: $id }) {
            alertGroup {
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
        id: group,
      },
    });
  }
}
