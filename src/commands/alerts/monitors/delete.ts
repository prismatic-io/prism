import { Command, Args } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql";

export default class DeleteCommand extends Command {
  static description = "Delete an Alert Monitor";
  static args = {
    monitor: Args.string({
      required: true,
      description: "ID of the monitor to delete",
    }),
  };

  async run() {
    const {
      args: { monitor },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: gql`
        mutation deleteAlertMonitor($id: ID!) {
          deleteAlertMonitor(input: { id: $id }) {
            alertMonitor {
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
        id: monitor,
      },
    });
  }
}
